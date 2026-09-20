import type { RouteLeg } from '../../types';
import { ModeIcon, modeMeta } from '../ui/ModeIcon';

export function JourneyTimeline({ legs, compact = false }: {legs: RouteLeg[];compact?: boolean;}) {
  return (
    <ol className="relative">
      {legs.map((leg, i) => {
        const color = modeMeta(leg.mode).color;
        const last = i === legs.length - 1;
        return (
          <li key={`${leg.label}-${i}`} className="relative flex gap-3.5 pb-5 last:pb-0">
            {!last &&
            <span
              aria-hidden
              className="absolute left-[17px] top-10 bottom-0 w-0.5 rounded-full"
              style={{ backgroundColor: `${color}40` }} />

            }
            <ModeIcon mode={leg.mode} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-sm font-semibold text-ink">{leg.label}</p>
                <p className="font-mono text-xs text-ink-muted">
                  {leg.depart} → {leg.arrive} · {leg.durationMin} min
                </p>
              </div>
              <p className="mt-0.5 text-[13px] text-ink-muted">
                {leg.from} <span className="text-ink-dim">→</span> {leg.to}
              </p>
              {!compact &&
              <p className="mt-1 text-xs text-ink-dim">
                  {leg.platform ? `${leg.platform} · ` : ''}
                  {leg.detail}
                </p>
              }
            </div>
          </li>);

      })}
    </ol>);

}