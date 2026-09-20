
import { useEffect, useState } from 'react';
import { NfcIcon, ShieldCheckIcon } from 'lucide-react';
import { upcomingJourney, user } from '../../data/journey';
import { Badge } from '../ui/Badge';

/** Deterministic block pattern standing in for the pass's rotating QR token. */
const qrCells = (seed: string) => Array.from({ length: 144 }, (_, i) => {
  const x = i % 12;
  const y = Math.floor(i / 12);
  const corner = x < 3 && y < 3 || x > 8 && y < 3 || x < 3 && y > 8;
  return corner || (x * 7 + y * 13 + x * y + seed.charCodeAt(i % seed.length)) % 3 === 0;
});

export function JourneyPass() {
  const [token, setToken] = useState(upcomingJourney.token);
  const [seconds, setSeconds] = useState(60);
  useEffect(() => {
    const timer = window.setInterval(() => {
      const remaining = 60 - Math.floor((Date.now() / 1000) % 60);
      setSeconds(remaining);
      if (remaining === 60) {
        if (typeof crypto.randomUUID === 'function') setToken(crypto.randomUUID());
        else {
          const bytes = new Uint8Array(16);
          crypto.getRandomValues(bytes);
          setToken(Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(''));
        }
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-line bg-surface-raised">
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-cyan">
          Universal Mobility Pass
        </p>
        <Badge tone="mint" dot pulse>
          Valid
        </Badge>
      </div>

      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <div className="shrink-0">
          <div
            className="grid grid-cols-12 gap-[2px] rounded-xl border border-hairline bg-base p-2.5"
            role="img"
            aria-label={`Rotating travel token, refreshes in ${seconds} seconds`}>
            
            {qrCells(token).map((on, i) =>
            <span
              key={i}
              className={`h-[7px] w-[7px] rounded-[1px] ${on ? 'bg-cyan' : 'bg-transparent'}`} />

            )}
          </div>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-ink-dim">
            <NfcIcon aria-hidden className="h-3.5 w-3.5" />
            Refreshes in {seconds}s · tap or scan
          </p>
        </div>

        <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3.5">
          <Row label="Passenger" value={user.fullName} />
          <Row label="Pass ID" value={user.passId} mono />
          <Row label="Journey" value={`${upcomingJourney.origin} → ${upcomingJourney.destination}`} />
          <Row label="Vehicle" value={upcomingJourney.vehicle} mono />
          <Row label="Gate" value={upcomingJourney.gate} />
          <Row label="Seat" value={upcomingJourney.seat} />
        </dl>
      </div>

      <p className="flex items-center gap-2 border-t border-hairline px-5 py-3 text-xs text-ink-dim">
        <ShieldCheckIcon aria-hidden className="h-3.5 w-3.5 text-mint" />
        Token refreshes every 60 seconds · works across metro, bus, air taxi and shuttle
      </p>
    </div>);

}

function Row({ label, value, mono = false }: {label: string;value: string;mono?: boolean;}) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-dim">{label}</dt>
      <dd className={`mt-0.5 text-[13px] font-medium text-ink ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>);

}