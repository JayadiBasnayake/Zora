import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, MapIcon, RadioIcon } from 'lucide-react';
import { JourneyPlannerForm } from '../components/planner/JourneyPlannerForm';
import { CityMap } from '../components/map/CityMap';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAppState } from '../state/AppState';
import { useAuth } from '../state/AuthState';
import { getTimeGreeting } from '../utils/datetime';

interface HomeProps {
  proactiveOrbit?: boolean;
}

export function Home({ proactiveOrbit = true }: HomeProps) {
  const navigate = useNavigate();
  const { activeJourney, holdShuttle } = useAppState();
  const { user } = useAuth();
  const greeting = getTimeGreeting();
  const firstName = user?.fullName.split(' ')[0] ?? 'traveller';
  const connection = activeJourney?.connection;
  const connectionAtRisk = Boolean(connection && connection.delayMin > connection.bufferMin && !connection.shuttleHeld);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 sm:py-10">
      <section className="home-hero relative overflow-hidden rounded-[28px] border border-cyan-line bg-surface shadow-panel">
        <div className="relative z-10 grid min-h-[420px] gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan">
              <span className="h-2 w-2 rounded-full bg-mint shadow-[0_0_0_5px_rgba(94,234,212,0.12)]" />
              Zora mobility network
            </div>
            <h1 className="mt-5 font-display text-[38px] font-bold leading-[0.98] tracking-[-0.04em] text-ink sm:text-[58px]">
              {greeting}, {firstName}.
              <span className="mt-2 block text-ink-muted">Move with the island.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-muted sm:text-base">
              Discover a clearer way across Sri Lanka, from coastal city links to highland connections.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => navigate('/plan')} icon={<ArrowRightIcon aria-hidden className="h-4 w-4" />}>
                Plan a journey
              </Button>
              <Button variant="secondary" onClick={() => navigate('/live')} icon={<MapIcon aria-hidden className="h-4 w-4" />}>
                Explore live map
              </Button>
            </div>
            <dl className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-hairline pt-5">
              <div><dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-dim">Network</dt><dd className="mt-1 font-display text-lg font-semibold text-ink">24/7</dd></div>
              <div><dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-dim">Regions</dt><dd className="mt-1 font-display text-lg font-semibold text-ink">Island-wide</dd></div>
              <div><dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-dim">Routes</dt><dd className="mt-1 font-display text-lg font-semibold text-ink">Live</dd></div>
            </dl>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-hairline bg-base/30 shadow-inner">
            <CityMap
              className="h-[290px] w-full sm:h-[350px]"
              highlightPath={activeJourney ? ['CMB', 'LOT', 'BOR', 'KOT', 'BAT', 'KAN'] : undefined}
              showLabels={false}
              showVehicles
              navigable />
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-hairline bg-base/75 px-3 py-2 text-[11px] text-ink-muted backdrop-blur">
              Live network · Sri Lanka
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-3xl">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan">Start moving</p><h2 className="mt-1 font-display text-2xl font-semibold text-ink">Where are you going?</h2></div>
          <button type="button" onClick={() => navigate('/plan')} className="hidden items-center gap-1 text-xs font-semibold text-cyan sm:flex">Full planner <ArrowRightIcon aria-hidden className="h-3.5 w-3.5" /></button>
        </div>
        <Card glass padding="lg">
          <JourneyPlannerForm onSubmit={() => navigate('/plan')} />
        </Card>
      </section>

      {activeJourney &&
      <section aria-label="Your next journey" className="mt-8">
          {proactiveOrbit && connection && (connectionAtRisk || connection.shuttleHeld) &&
        <Alert
          severity={connectionAtRisk ? 'warning' : 'positive'}
          title={connectionAtRisk ? `Delayed ${connection.delayMin} min · your connection is tight` : `Shuttle held until ${connection.holdUntil}`}
          className="mb-4"
          actions={connectionAtRisk ?
          <Button size="sm" variant="primary" onClick={holdShuttle}>Hold my shuttle</Button> :
          undefined}>
              {connectionAtRisk ? 'The metro is running behind. Ask the network to hold your onward shuttle.' : 'Your onward shuttle will wait for you.'}
            </Alert>
        }

          <Card padding="lg">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan">Your next journey</p>
                <p className="mt-2 font-display text-2xl font-semibold text-ink">
                  {activeJourney.origin} <span className="text-ink-dim">→</span> {activeJourney.destination}
                </p>
                <p className="mt-1.5 font-mono text-sm text-ink-muted">
                  {activeJourney.depart} – {activeJourney.arrive} · {activeJourney.gate}
                </p>
              </div>
              <Badge tone={connectionAtRisk ? 'amber' : 'mint'} dot>{connectionAtRisk ? `Delayed ${connection?.delayMin} min` : 'On schedule'}</Badge>
            </div>
            <Button className="mt-5" variant="primary" block onClick={() => navigate('/trips/live')} icon={<RadioIcon aria-hidden className="h-4 w-4" />}>
              Track journey
            </Button>
          </Card>
        </section>
      }
    </div>
  );
}
