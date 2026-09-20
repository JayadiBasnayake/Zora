import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfoIcon } from 'lucide-react';
import { JourneyPlannerForm } from '../components/planner/JourneyPlannerForm';
import { RouteCard } from '../components/journey/RouteCard';
import { CityMap } from '../components/map/CityMap';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { SectionHeading } from '../components/ui/SectionHeading';
import { routeOptions } from '../data/routes';
import type { RouteOption } from '../types';
import { searchRoutes } from '../services/mockApi';
import { useAppState } from '../state/AppState';

type SortKey = 'time' | 'cost' | 'reliability';

const sorters: Record<SortKey, (a: RouteOption, b: RouteOption) => number> = {
  time: (a, b) => a.durationMin - b.durationMin,
  cost: (a, b) => a.cost - b.cost,
  reliability: (a, b) => b.reliability - a.reliability
};

const sortChips: [SortKey, string][] = [
  ['time', 'Fastest'],
  ['cost', 'Cheapest'],
  ['reliability', 'Most reliable']
];

// Draws whatever route is currently selected. Dynamically-searched routes
// carry their own stationPath (built by utils/routing.ts) which we use
// directly; the legacy demo routeOptions fall back to a fixed path so the
// idle/demo state still looks reasonable.
const legacyHighlight: Record<string, string[]> = {
  A: ['CMB', 'LOT', 'BOR', 'KOT', 'BAT', 'KAN'],
  B: ['CMB', 'KOT', 'KEG', 'KAN'],
  C: ['PRT', 'BAT', 'KAN'],
  D: ['CMB', 'KOT', 'KEG', 'KAN']
};

const highlightFor = (route: RouteOption | undefined): string[] => {
  if (!route) return [];
  if (route.stationPath?.length) return route.stationPath;
  return legacyHighlight[route.id] ?? [];
};

export function Planner() {
  const navigate = useNavigate();
  const { plannerQuery, addPlannedJourney } = useAppState();
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'empty'>('idle');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selected, setSelected] = useState('A');
  const [sort, setSort] = useState<SortKey>('time');
  const [booking, setBooking] = useState<RouteOption | null>(null);
  const [booked, setBooked] = useState(false);

  const sorted = useMemo(() => [...routes].sort(sorters[sort]), [routes, sort]);
  const active = sorted.find((r) => r.id === selected) ?? sorted[0] ?? routeOptions[0];

  useEffect(() => {
    if (sorted.length && !sorted.some((route) => route.id === selected)) setSelected(sorted[0].id);
  }, [selected, sorted]);

  const search = async () => {
    if (searching) return;
    setSearching(true); setStatus('loading');
    try {
      const found = await searchRoutes(plannerQuery);
      setRoutes(found); setStatus(found.length ? 'success' : 'empty');
      if (found.length) setSelected(found[0].id);
    } catch { setStatus('error'); }
    finally { setSearching(false); }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6">
      <SectionHeading
        title="Plan your journey"
        description="One search across rail, bus, air taxi and smart roads." />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card padding="lg">
            <JourneyPlannerForm onSubmit={search} loading={searching} />
          </Card>

          <div className="hidden overflow-hidden rounded-2xl border border-hairline bg-surface lg:block">
            <CityMap className="h-72 w-full" highlightPath={highlightFor(active)} showLabels={false} />
            <p className="border-t border-hairline px-4 py-2.5 text-xs text-ink-muted">
              {active.name} plotted · {active.legs.length} stage{active.legs.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-ink-muted">
            {searching ? 'Finding routes…' : status === 'idle' ? 'Enter a journey to see route options' : `${sorted.length} routes · ${plannerQuery.from} → ${plannerQuery.to}`}
          </p>

          {status === 'success' &&
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Sort routes by">
              {sortChips.map(([id, label]) =>
            <button key={id} type="button" aria-pressed={sort === id} onClick={() => setSort(id)} className={`min-h-11 rounded-xl border px-3 text-xs font-medium transition-colors duration-150 ease-out ${sort === id ? 'border-cyan-line bg-cyan-soft text-cyan' : 'border-hairline text-ink-muted hover:border-cyan-line hover:text-ink'}`}>
                  {label}
                </button>
            )}
            </div>
          }

          {searching &&
          <ul className="mt-4 space-y-4" aria-hidden>
              {[0, 1, 2].map((i) =>
            <li key={i} className="h-56 animate-pulse rounded-2xl border border-hairline bg-surface" />
            )}
            </ul>
          }

          {!searching && status === 'success' &&
          <ul className="mt-4 space-y-4">
              {sorted.map((r) =>
            <RouteCard
              key={r.id}
              route={r}
              selected={r.id === selected}
              onSelect={() => setSelected(r.id)}
              onBook={() => {
                setSelected(r.id);
                setBooking(r);
              }} />
            )}
            </ul>
          }

          {!searching && status === 'idle' &&
          <Card padding="lg" className="mt-4 text-center">
              <InfoIcon aria-hidden className="mx-auto h-6 w-6 text-ink-dim" />
              <p className="mt-3 text-sm font-semibold text-ink">Ready to plan</p>
              <p className="mt-1 text-[13px] text-ink-muted">Set an origin and destination, then plan your journey.</p>
            </Card>
          }
          {!searching && status === 'empty' && <Card padding="lg" className="mt-4 text-center"><InfoIcon aria-hidden className="mx-auto h-6 w-6 text-ink-dim" /><p className="mt-3 text-sm font-semibold text-ink">No routes match this journey</p><p className="mt-1 text-[13px] text-ink-muted">Check the spelling of your origin and destination, or turn off step-free only.</p></Card>}
          {!searching && status === 'error' && <Card padding="lg" className="mt-4 text-center"><p className="text-sm font-semibold text-ink">We could not load routes</p><p className="mt-1 text-[13px] text-ink-muted">Check your connection and try again.</p><Button className="mt-4" variant="secondary" onClick={search}>Retry</Button></Card>}
        </div>
      </div>

      <Modal
        open={booking !== null}
        onClose={() => {
          setBooking(null);
          setBooked(false);
        }}
        title={booked ? 'Journey booked' : `Confirm ${booking?.name ?? ''}`}
        description={booked ? 'Your Universal Mobility Pass has been updated across every leg.' : 'Your pass covers all legs — no separate tickets needed.'}
        footer={
        booked ?
        <Button variant="primary" onClick={() => navigate('/trips')}>Open my trips</Button> :
        <>
              <Button variant="ghost" onClick={() => setBooking(null)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (!booking) return;
                  addPlannedJourney(plannerQuery, booking);
                  setBooked(true);
                }}
              >
                Confirm journey · {booking?.cost.toFixed(1)} credits
              </Button>
            </>
        }>
        {booking && <div className="space-y-5">
          <div className="rounded-2xl border border-cyan-line bg-cyan-soft p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan">Journey summary</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <div><p className="font-display text-2xl font-semibold text-ink">{plannerQuery.from} <span className="text-ink-dim">→</span> {plannerQuery.to}</p><p className="mt-1 text-sm text-ink-muted">{booking.departs} to {booking.arrives} · {booking.legs.length} stages</p></div>
              <p className="font-display text-2xl font-semibold text-ink">{booking.cost.toFixed(2)} <span className="text-sm font-normal text-ink-muted">credits</span></p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2"><Badge tone="cyan">{booking.durationMin} min</Badge><Badge tone="neutral">{booking.transfers} transfers</Badge><Badge tone="violet">{booking.reliability}% reliable</Badge><Badge tone="neutral">{booking.walkingM === 0 ? 'No walking' : `${booking.walkingM} m walking`}</Badge></div>
          <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Stages</p><ul className="space-y-2">{booking.legs.map((leg) => <li key={`${leg.label}-${leg.depart}`} className="flex items-center justify-between gap-3 rounded-xl border border-hairline px-3 py-2.5"><span className="min-w-0"><span className="block truncate text-sm font-medium text-ink">{leg.label}</span><span className="block text-xs text-ink-muted">{leg.from} → {leg.to}</span></span><span className="shrink-0 font-mono text-xs text-ink-muted">{leg.depart}</span></li>)}</ul></div>
        </div>}
      </Modal>
    </div>);

}
