import type { AccessibilityFeature, AccessibilityStatus } from '../data/accessibility';

export type TransportModeId =
'metro' |
'bus' |
'airtaxi' |
'shuttle' |
'intercity' |
'walk';

export type AccessibilityNeed = AccessibilityFeature;
export type AccessibilityMap = Record<AccessibilityFeature, AccessibilityStatus>;

export type OrbitAction = 'DISPATCH_SOS' | 'OPEN_EMERGENCY' | 'CHECK_CONNECTION' | 'HOLD_SHUTTLE' | 'VIEW_ALTERNATIVE' | 'KEEP_JOURNEY' | 'OPEN_JOURNEY' | 'PLAN_FIRST_JOURNEY';

export interface Station {
  id: string;
  name: string;
  short: string;
  x: number;
  y: number;
  lat?: number;
  lon?: number;
  kind: 'hub' | 'station' | 'skyport' | 'stop' | 'landmark';}

export interface RouteLeg {
  mode: TransportModeId;
  label: string;
  from: string;
  to: string;
  depart: string;
  arrive: string;
  durationMin: number;
  detail: string;
  platform?: string;
  accessibility: AccessibilityMap;
}

export interface RouteOption {
  id: string;
  name: string;
  durationMin: number;
  cost: number;
  transfers: number;
  reliability: number;
  walkingM: number;
  energyKwh?: number;
  description?: string;
  departs: string;
  arrives: string;
  tag?: string;
  legs: RouteLeg[];
  accessibility: AccessibilityMap;
  /** Station ids visited in order, used to draw this route on the map. Optional for statically-authored demo routes. */
  stationPath?: string[];
}

export interface OrbitMessage {
  id: string;
  from: 'orbit' | 'user';
  body: string;
  time: string;
  severity?: 'info' | 'warning' | 'positive';
  actions?: {label: string;action: OrbitAction;}[];
}

export interface TrackedStep {
  id: string;
  label: string;
  detail: string;
  state: 'done' | 'current' | 'upcoming';
  time: string;
  mode?: TransportModeId;
}

export interface LiveVehicle {
  id: string;
  code: string;
  mode: TransportModeId;
  path: string[];
  offset: number;
  speedKmh: number;
  occupancy: number;
}