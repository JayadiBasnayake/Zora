import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, GaugeIcon, MapPinIcon, RouteIcon } from 'lucide-react';
import { CityMap } from '../components/map/CityMap';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Stat } from '../components/ui/Stat';
import { ModeIcon } from '../components/ui/ModeIcon';
import { liveTelemetry, trackedSteps, upcomingJourney } from '../data/journey';

export function Tracking() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Badge tone="cyan" dot pulse>
              Live
            </Badge>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              {upcomingJourney.vehicle} · {upcomingJourney.seat}
            </p>
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {upcomingJourney.origin} <span className="text-ink-dim">→</span> {upcomingJourney.destination}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Arriving</p>
          <p className="font-display text-3xl font-semibold text-cyan">{liveTelemetry.etaClock}</p>
          <p className="text-[13px] text-ink-muted">in {liveTelemetry.etaMinutes} min</p>
        </div>
      </header>

      {!dismissed &&
      <Alert
        severity="positive"
        title="Your connection is waiting 3 minutes"
        className="mt-6"
        actions={
        <>
              <Button size="sm" variant="quiet" onClick={() => setDismissed(true)}>
                Got it
              </Button>
              
            </>
        }>
        
          Smart Shuttle SS-5521 is holding at Kandy Skyport bay 3. No action needed.
        </Alert>
      }

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card padding="none" className="overflow-hidden">
          <CityMap
            className="h-[300px] w-full sm:h-[420px]"
            highlightPath={['CMB', 'LOT', 'BOR', 'KOT', 'BAT', 'KAN']}
            layers={['metro', 'air']}
            showLabels />
          
          <div className="border-t border-hairline p-5">
            <Progress
              label={`Progress · next stop ${liveTelemetry.nextStation}`}
              valueLabel={`${liveTelemetry.remainingKm} km remaining`}
              value={liveTelemetry.progress * 100} />
            
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
              <Stat label="Speed" value={String(liveTelemetry.speedKmh)} unit="km/h" icon={<GaugeIcon className="h-3.5 w-3.5" />} />
              <Stat label="Next station" value={`${liveTelemetry.nextStationMin} min`} hint={liveTelemetry.nextStation} icon={<MapPinIcon className="h-3.5 w-3.5" />} />
            </dl>
          </div>
        </Card>

        <Card padding="lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Your journey</p>
          <ol className="mt-5">
            {trackedSteps.map((s, i) => {
              const last = i === trackedSteps.length - 1;
              return (
                <li key={s.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {!last &&
                  <span
                    aria-hidden
                    className={`absolute left-[11px] top-6 bottom-0 w-0.5 rounded-full ${
                    s.state === 'done' ? 'bg-mint/50' : 'bg-white/10'}`
                    } />

                  }
                  <span
                    className={[
                    'relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                    s.state === 'done' ?
                    'border-mint bg-mint/20 text-mint' :
                    s.state === 'current' ?
                    'border-cyan bg-cyan text-[#03151f]' :
                    'border-white/15 bg-surface text-ink-dim'].
                    join(' ')}>
                    
                    {s.state === 'done' ?
                    <CheckIcon aria-hidden className="h-3.5 w-3.5" /> :
                    s.state === 'current' ?
                    <span className="h-2 w-2 rounded-full bg-[#03151f]" /> :

                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    }
                    {s.state === 'current' &&
                    <span className="absolute inset-0 animate-ping rounded-full border border-cyan/60" />
                    }
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className={`text-sm font-semibold ${s.state === 'upcoming' ? 'text-ink-muted' : 'text-ink'}`}>
                        {s.label}
                      </p>
                      <p className="font-mono text-xs text-ink-dim">{s.time}</p>
                    </div>
                    <p className="mt-0.5 text-[13px] text-ink-muted">{s.detail}</p>
                    {s.mode &&
                    <span className="mt-2 inline-flex">
                        <ModeIcon mode={s.mode} size="sm" />
                      </span>
                    }
                  </div>
                </li>);

            })}
          </ol>

          <div className="mt-2 flex flex-wrap gap-2 border-t border-hairline pt-5">
            <Button variant="secondary" size="sm" icon={<RouteIcon aria-hidden className="h-4 w-4" />} onClick={() => navigate('/plan')}>
              Change onward route
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/emergency')}>
              Need assistance
            </Button>
          </div>
        </Card>
      </div>
    </div>);

}