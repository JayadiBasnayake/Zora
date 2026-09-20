import { useNavigate } from 'react-router-dom';
import { RadioIcon } from 'lucide-react';
import { JourneyPlannerForm } from '../components/planner/JourneyPlannerForm';
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
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-[32px] font-bold leading-[1.05] tracking-[-0.04em] text-ink sm:text-[44px]">
        {greeting}, {firstName}.
        <span className="block text-ink-muted">Where to?</span>
      </h1>

      <Card glass padding="lg" className="mt-6">
        <JourneyPlannerForm onSubmit={() => navigate('/plan')} />
      </Card>

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
