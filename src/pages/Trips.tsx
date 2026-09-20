import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClockIcon,
  PencilLineIcon,
  RadioIcon,
  Share2Icon,
  Trash2Icon } from
'lucide-react';
import { JourneyPass } from '../components/journey/JourneyPass';
import { JourneyTimeline } from '../components/journey/JourneyTimeline';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Progress } from '../components/ui/Progress';
import { Stat } from '../components/ui/Stat';
import { Tabs } from '../components/ui/Tabs';
import { laterJourneys, pastJourneys, upcomingJourney, user } from '../data/journey';
import { routeOptions } from '../data/routes';
import { useAppState } from '../state/AppState';
import { useAuth } from '../state/AuthState';
import { getTimeGreeting } from '../utils/datetime';

export function Trips({ proactiveOrbit = true }: {proactiveOrbit?: boolean;}) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('upcoming');
  const [dialog, setDialog] = useState<'modify' | 'share' | 'cancel' | null>(null);
  const [saved, setSaved] = useState(false);
  const [departure, setDeparture] = useState('08:40 · 32 min · 4.8 cr (current)');
  const [tripStatus, setTripStatus] = useState('Booked');
  const { activeJourney, plannedJourneys, removePlannedJourney } = useAppState();
  const { user: account } = useAuth();
  const [shareCopied, setShareCopied] = useState(false);
  const hasBookedHistory = Boolean(activeJourney);

  if (!activeJourney && plannedJourneys.length === 0) return <div className="mx-auto w-full max-w-[900px] px-4 py-16 text-center sm:px-6"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan">My trips</p><h1 className="mt-3 font-display text-3xl font-semibold text-ink">Your journeys will appear here</h1><p className="mt-3 text-sm text-ink-muted">Plan your first journey to see upcoming trips, passes, and saved routes.</p><Button variant="primary" className="mt-6" onClick={() => navigate('/plan')}>Plan your first journey</Button></div>;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            {upcomingJourney.date}
          </p>
          <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {getTimeGreeting()}, {account?.fullName ?? 'traveller'}
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">{user.tier} · member since {user.since}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => navigate('/trips/live')} icon={<RadioIcon aria-hidden className="h-4 w-4" />}>
            Track live
          </Button>
        </div>
      </header>

      {proactiveOrbit &&
      <Alert
        severity="positive"
        title="Your connection is waiting 3 minutes"
        className="mt-6">
        
          Smart Shuttle SS-5521 is holding at Kandy Skyport bay 3 so your transfer stays intact.
        </Alert>
      }

      {activeJourney ?
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card padding="lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan">Upcoming journey</p>
              <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
                {upcomingJourney.origin} <span className="text-ink-dim">→</span> {upcomingJourney.destination}
              </p>
              <p className="mt-2 font-mono text-sm text-ink-muted">
                {upcomingJourney.depart} – {upcomingJourney.arrive} · {upcomingJourney.destinationDetail}
              </p>
            </div>
            <Badge tone="mint" dot pulse>{tripStatus}</Badge>
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-x-6 gap-y-5 border-t border-hairline pt-6">
            <Stat label="Vehicle" value={upcomingJourney.vehicle} />
            <Stat label="Gate" value="4" hint="Platform 2" />
            <Stat label="Fare" value={upcomingJourney.cost.toFixed(1)} unit="cr" />
          </dl>
          <Progress className="mt-6" label="Boarding window" valueLabel="Opens in 12 min" value={34} />
          <div className="mt-6 flex flex-wrap gap-2 border-t border-hairline pt-6">
            <Button variant="secondary" onClick={() => setDialog('modify')} icon={<PencilLineIcon aria-hidden className="h-4 w-4" />}>Modify Journey</Button>
            <Button variant="secondary" onClick={() => setDialog('share')} icon={<Share2Icon aria-hidden className="h-4 w-4" />}>Share Trip</Button>
            <Button variant="ghost" onClick={() => setDialog('cancel')} icon={<Trash2Icon aria-hidden className="h-4 w-4" />}>Cancel</Button>
          </div>
        </Card>
        <JourneyPass />
      </div> :
      <Card padding="lg" className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan">Planned journeys</p>
        <p className="mt-2 text-sm text-ink-muted">Your saved journey plans are ready below. Confirmed network routes are stored automatically in My Trips.</p>
      </Card>}

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Tabs
            label="Journey history"
            value={tab}
            onChange={setTab}
            items={[
            { id: 'upcoming', label: 'Upcoming', count: plannedJourneys.length + (hasBookedHistory ? laterJourneys.length : 0) },
            { id: 'past', label: 'Past', count: hasBookedHistory ? pastJourneys.length : 0 }]
            } />
          
          <ul className="mt-4 space-y-2">
            {tab === 'upcoming' ?
            <>
              {plannedJourneys.map((j) =>
              <Card as="li" key={j.id} padding="md" className="flex items-center gap-4 border-cyan-line">
                <CalendarClockIcon aria-hidden className="h-4.5 w-4.5 shrink-0 text-cyan" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{j.from} <span className="text-ink-dim">→</span> {j.to}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{j.date} · {j.time} · {j.route.durationMin} min · {j.passengers} passenger{j.passengers === 1 ? '' : 's'}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone="cyan">Planned</Badge>
                  <button type="button" onClick={() => removePlannedJourney(j.id)} className="rounded-lg p-2 text-ink-dim hover:bg-surface-raised hover:text-ink" aria-label={`Remove ${j.from} to ${j.to}`}>
                    <Trash2Icon aria-hidden className="h-4 w-4" />
                  </button>
                </div>
              </Card>
              )}
              {hasBookedHistory && laterJourneys.map((j) =>
              <Card as="li" key={j.id} padding="md" className="flex items-center gap-4">
                <CalendarClockIcon aria-hidden className="h-4.5 w-4.5 shrink-0 text-cyan" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{j.route}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{j.when} · {j.mode}</p>
                </div>
                <Badge tone={j.status === 'Auto-booked' ? 'violet' : 'neutral'}>{j.status}</Badge>
              </Card>
              )}
            </> :
            (hasBookedHistory ? pastJourneys : []).map((j) =>
            <Card as="li" key={j.id} padding="md" className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{j.route}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">{j.when}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[13px] text-ink">{j.spend.toFixed(1)} cr</p>
                    </div>
                  </Card>
            )}
          </ul>
        </div>

        <Card padding="lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Today's stages
          </p>
          <div className="mt-4">
            <JourneyTimeline legs={plannedJourneys[0]?.route.legs ?? routeOptions[0].legs} />
          </div>

          {tab === 'past' &&
          <Card padding="lg" className="mt-6 border-mint/30">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mint">Journey complete</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Colombo → Kandy</h2>
                <p className="mt-1 text-[13px] text-ink-muted">You travelled through the Highland Corridor.</p>
              </div>
              <Badge tone="mint">Arrived 09:32</Badge>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-hairline pt-5">              <Stat label="Duration" value="28" unit="min" />
              <Stat label="Transfers" value="1" />
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => navigate('/trips/live')}>View journey</Button>
              <Button variant="ghost" size="sm" onClick={() => setSaved(true)}>{saved ? 'Journey saved' : 'Save journey'}</Button>
            </div>
          </Card>
          }
        </Card>
      </div>

      <Modal
        open={dialog === 'modify'}
        onClose={() => setDialog(null)}
        title="Modify journey"
        description="Shift your departure and every connection re-books automatically."
        footer={
        <>
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Keep as is
            </Button>
            <Button variant="primary" onClick={() => { setDialog(null); setTripStatus(`Departure ${departure.split(' · ')[0]}`); }}>
              Apply {departure === '08:40 · 32 min · 4.8 cr (current)' ? 'changes' : 'departure'}
            </Button>
          </>
        }>
        
        <ul className="space-y-2">
          {['08:10 · 34 min · 4.8 cr', '08:40 · 32 min · 4.8 cr (current)', '09:10 · 31 min · 5.2 cr', '09:40 · 36 min · 4.2 cr'].map((o) =>
          <li key={o}>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-hairline bg-surface-raised px-4 py-3 text-[13px] transition-colors duration-150 ease-out hover:border-cyan-line">
                <input type="radio" name="departure" checked={departure === o} onChange={() => setDeparture(o)} className="accent-cyan" />
                <span className="font-mono text-ink">{o}</span>
              </label>
            </li>
          )}
        </ul>
      </Modal>

      <Modal
        open={dialog === 'share'}
        onClose={() => setDialog(null)}
        title="Share trip"
        description="Share live progress and arrival time — revoked automatically when you arrive."
        width="sm"
        footer={<Button variant="primary" onClick={async () => { const link = `${window.location.origin}/live/${upcomingJourney.token.toLowerCase()}`; try { await navigator.clipboard.writeText(link); } catch { /* MOCK: clipboard fallback is visual-only in restricted browsers. */ } setShareCopied(true); }}> {shareCopied ? 'Copied' : 'Copy live link'}</Button>}>
        
        <p className="rounded-xl border border-hairline bg-surface-raised p-4 font-mono text-[13px] text-cyan">
          t2100.city/live/{upcomingJourney.token.toLowerCase()}
        </p>
      </Modal>

      <Modal
        open={dialog === 'cancel'}
        onClose={() => setDialog(null)}
        title="Cancel this journey?"
        description="Your 4.8 credits are refunded in full up to 10 minutes before departure."
        width="sm"
        footer={
        <>
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Keep journey
            </Button>
            <Button variant="danger" onClick={() => { setTripStatus('Cancelled'); setDialog(null); }}>
              Cancel journey
            </Button>
          </>
        } />
      
    </div>);

}