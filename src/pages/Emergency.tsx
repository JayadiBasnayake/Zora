import { useEffect, useState } from 'react';
import {
  AlertTriangleIcon,
  BusIcon,
  HandIcon,
  HeartPulseIcon,
  MapPinIcon,
  PhoneIcon,
  UserSearchIcon } from
'lucide-react';
import { CityMap } from '../components/map/CityMap';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { currentLocation, EMERGENCY_NUMBER, emergencyOptions, nearbyFacilities } from '../data/emergency';
import { useAppState } from '../state/AppState';

const icons = {
  heart: HeartPulseIcon,
  alert: AlertTriangleIcon,
  bus: BusIcon,
  user: UserSearchIcon,
  hand: HandIcon
};

export function Emergency() {
  const [confirm, setConfirm] = useState<string | null>(null);
  const [escortRequested, setEscortRequested] = useState(false);
  const [location, setLocation] = useState('');
  const [locationSource, setLocationSource] = useState<'geolocation' | 'manual'>('manual');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState('');
  const [now, setNow] = useState(Date.now());
  const { activeJourney, emergency, dispatchEmergency, clearEmergency } = useAppState();

  const selected = emergencyOptions.find((o) => o.id === confirm);
  const remainingSeconds = emergency.active ? Math.max(0, emergency.etaSeconds - Math.floor((now - emergency.dispatchedAt) / 1000)) : 0;

  useEffect(() => {
    if (activeJourney) setLocation(currentLocation.label);
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => { setLocation(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)} (approximate)`); setLocationSource('geolocation'); },
      () => { if (!activeJourney) setLocation('Location unavailable - please describe where you are.'); },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, [activeJourney]);

  useEffect(() => {
    if (!emergency.active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [emergency.active]);

  const handleDispatch = async () => {
    if (!selected || !location.trim() || dispatching || emergency.active) return;
    setDispatching(true); setDispatchError('');
    try { await dispatchEmergency(selected.title, location.trim()); setConfirm(null); }
    catch (error) { setDispatchError(error instanceof Error ? error.message : 'Emergency dispatch failed.'); }
    finally { setDispatching(false); }
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <div className="rounded-[28px] border border-coral/40 bg-coral-soft p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="coral" dot pulse>Emergency mode</Badge>
          <p className="text-[13px] text-ink-muted">Your location is shared with responders as soon as you choose a category.</p>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">I need help</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">Choose the closest match. Your location is sent to the mock emergency dispatch service for this prototype.</p>

        <a href={`tel:${EMERGENCY_NUMBER}`} className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-coral px-6 text-base font-semibold text-[#2a0710] sm:w-auto">
          <PhoneIcon aria-hidden className="h-5 w-5" />
          Call emergency services · {EMERGENCY_NUMBER}
        </a>
      </div>

      {emergency.active &&
      <Alert severity="critical" title="Responders dispatched" className="mt-6">
        {remainingSeconds > 0 ? `Estimated response in ${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')}.` : 'Responders arriving.'} Location: {emergency.location}.
        <Button variant="ghost" size="sm" className="mt-3" onClick={clearEmergency}>Cancel / I’m safe</Button>
      </Alert>
      }

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {emergencyOptions.map((o) => {
          const Icon = icons[o.icon];
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => setConfirm(o.id)}
                className="flex h-full w-full items-start gap-4 rounded-2xl border border-hairline bg-surface p-5 text-left transition-[border-color,background-color] duration-150 ease-out hover:border-coral/45 hover:bg-surface-raised">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-coral/35 bg-coral-soft text-coral">
                  <Icon aria-hidden className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-ink">{o.title}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-ink-muted">{o.detail}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card padding="none" className="overflow-hidden">
          {activeJourney && <CityMap className="h-64 w-full" selectedStation="KAN" layers={['metro', 'air', 'road']} showAlerts />}
          <div className="border-t border-hairline p-5">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              <MapPinIcon aria-hidden className="h-3.5 w-3.5 text-coral" />
              Your location
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">{location || 'Detecting your location…'}</p>
            <p className="mt-1 text-xs text-ink-muted">{locationSource === 'geolocation' ? 'Detected from this device · approximate' : 'Approximate location · confirm or edit before dispatch'}</p>
            <input aria-label="Emergency location" value={location} onChange={(event) => { setLocation(event.target.value); setLocationSource('manual'); }} className="mt-3 h-11 w-full rounded-xl border border-hairline bg-surface-raised px-3 text-sm text-ink outline-none focus:border-coral" />
            {activeJourney && <p className="mt-1 text-xs text-ink-dim">Vehicle: {activeJourney.vehicle}</p>}
          </div>
        </Card>

        <Card padding="lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Nearby emergency facilities</p>
          <ul className="mt-4 space-y-2">
            {nearbyFacilities.map((f) =>
            <li key={f.id} className="flex items-center gap-4 rounded-xl border border-hairline bg-surface-raised px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{f.name}</p>
                  <p className="text-xs text-ink-dim">{f.kind} · {f.distance}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[13px] text-ink">{f.eta}</p>
                  <p className="text-[11px] text-mint">Open</p>
                </div>
              </li>
            )}
          </ul>
          <Button variant="secondary" block className="mt-5" onClick={() => setEscortRequested(true)}>{escortRequested ? 'Escort requested' : 'Request escort to nearest facility'}</Button>
        </Card>
      </div>

      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={selected ? `Confirm: ${selected.title}` : 'Confirm emergency'}
        description="Confirming shares your live location, vehicle and pass identity with responders."
        width="sm"
        footer={
        <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>Go back</Button>
            <Button variant="danger" loading={dispatching} disabled={dispatching || emergency.active || !location.trim()} onClick={handleDispatch}>{dispatching ? 'Dispatching…' : 'Send for help now'}</Button>
          </>
        }>
        <p className="text-[13px] leading-relaxed text-ink-muted">{selected?.detail}</p>
        <p className="mt-4 rounded-xl border border-hairline bg-surface-raised p-4 text-[13px] text-ink">Dispatch location: {location || 'Location not available'}</p>
        {dispatchError && <p role="alert" className="mt-3 rounded-xl border border-coral/40 bg-coral-soft p-3 text-sm text-coral">{dispatchError} Call {EMERGENCY_NUMBER} if you need immediate help.</p>}
      </Modal>
    </div>
  );
}
