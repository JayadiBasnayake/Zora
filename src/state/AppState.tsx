import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { upcomingJourney } from '../data/journey';
import type { RouteOption } from '../types';
import { useAuth } from './AuthState';
import { dispatchEmergency as apiDispatchEmergency, restoreEmergency, saveEmergency, type MockEmergency } from '../services/mockApi';
import type { AccessibilityFeature } from '../data/accessibility';
import { nextDeparture } from '../utils/datetime';
import { readStorage, removeStorage, writeStorage } from '../utils/storage';

export interface PlannerQuery {
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  accessibility: AccessibilityFeature[];
}

export interface EmergencyStatus {
  active: boolean;
  category: string;
  location: string;
  vehicle: string;
  eta: string;
  incidentId: string;
  etaSeconds: number;
  dispatchedAt: number;
}

export interface JourneyConnection {
  delayMin: number;
  bufferMin: number;
  shuttleHeld: boolean;
  holdUntil: string | null;
}

type ActiveJourney = typeof upcomingJourney & {connection: JourneyConnection};

export interface PlannedJourney {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  route: RouteOption;
  createdAt: number;
}

const plannedJourneysKey = (userId: string) => `transport-planned-journeys:${userId}`;

interface AppStateValue {
  activeJourney: ActiveJourney | null;
  emergency: EmergencyStatus;
  dispatchEmergency: (category?: string, location?: string) => Promise<void>;  clearEmergency: () => void;
  holdShuttle: () => void;
  keepJourney: () => void;
  plannerQuery: PlannerQuery;
  updatePlannerQuery: (patch: Partial<PlannerQuery>) => void;
  plannedJourneys: PlannedJourney[];
  addPlannedJourney: (query: PlannerQuery, route: RouteOption) => void;
  removePlannedJourney: (id: string) => void;
}

const defaultEmergency: EmergencyStatus = {
  active: false,
  category: '',
  location: 'Location unavailable · approximate help available',
  vehicle: '',
  eta: '2 min', incidentId: '', etaSeconds: 0, dispatchedAt: 0
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [emergency, setEmergency] = useState<EmergencyStatus>(defaultEmergency);
  const [connection, setConnection] = useState<JourneyConnection>({ delayMin: 6, bufferMin: 4, shuttleHeld: false, holdUntil: null });
  const [plannerQuery, setPlannerQuery] = useState<PlannerQuery>(() => ({ from: user?.id === 'demo-jayadi' ? 'Colombo Mobility Hub' : '', to: user?.id === 'demo-jayadi' ? 'Kandy Skyport' : '', ...nextDeparture(), passengers: 1, accessibility: [] }));
  const [plannedJourneys, setPlannedJourneys] = useState<PlannedJourney[]>([]);
  const activeJourney = useMemo<ActiveJourney | null>(() => user?.id === 'demo-jayadi' ? { ...upcomingJourney, connection } : null, [user?.id, connection]);

  useEffect(() => {
    if (!user?.id) {
      setPlannedJourneys([]);
      return;
    }
    setPlannedJourneys(readStorage<PlannedJourney[]>(plannedJourneysKey(user.id)) ?? []);
  }, [user?.id]);

  useEffect(() => {
    const restored = restoreEmergency(user?.id ?? null);
    if (restored) setEmergency({ ...restored, eta: `${Math.ceil(Math.max(0, restored.etaSeconds - (Date.now() - restored.dispatchedAt) / 1000) / 60)} min` });
    else setEmergency(defaultEmergency);
  }, [user?.id]);

  useEffect(() => {
    setPlannerQuery((current) => ({ ...current, from: user?.id === 'demo-jayadi' ? 'Colombo Mobility Hub' : '', to: user?.id === 'demo-jayadi' ? 'Kandy Skyport' : '' }));
  }, [user?.id]);

  const value = useMemo<AppStateValue>(() => ({
    activeJourney,
    emergency,
    // Mock dispatch state: replace with the emergency service API when available.
    dispatchEmergency: async (category = 'Emergency assistance', location = defaultEmergency.location) => {
      // Resolves once dispatch succeeds and rejects if it fails, so callers can show an honest error.
      const result: MockEmergency = await apiDispatchEmergency(category, location, activeJourney?.vehicle ?? '');
      setEmergency({ ...result, eta: '2 min' });
      await saveEmergency(user?.id ?? null, result);
    },
    clearEmergency: () => { setEmergency(defaultEmergency); void saveEmergency(user?.id ?? null, null); },
    holdShuttle: () => setConnection((current) => current.shuttleHeld ? current : { ...current, shuttleHeld: true, holdUntil: '09:15' }),
    keepJourney: () => setConnection((current) => current),
    plannerQuery,
    updatePlannerQuery: (patch) => setPlannerQuery((current) => ({ ...current, ...patch })),
    plannedJourneys,
    addPlannedJourney: (query, route) => {
      if (!user?.id) return;
      const next: PlannedJourney = {
        id: `planned-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        from: query.from,
        to: query.to,
        date: query.date,
        time: query.time,
        passengers: query.passengers,
        route,
        createdAt: Date.now()
      };
      setPlannedJourneys((current) => {
        const updated = [next, ...current];
        writeStorage(plannedJourneysKey(user.id), updated);
        return updated;
      });
    },
    removePlannedJourney: (id) => {
      if (!user?.id) return;
      setPlannedJourneys((current) => {
        const updated = current.filter((journey) => journey.id !== id);
        if (updated.length) writeStorage(plannedJourneysKey(user.id), updated);
        else removeStorage(plannedJourneysKey(user.id));
        return updated;
      });
    }
  }), [activeJourney, emergency, plannerQuery, plannedJourneys, user?.id]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
}
