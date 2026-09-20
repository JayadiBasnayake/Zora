import React, { useState } from 'react';
import { ChevronDownIcon, FootprintsIcon, GaugeIcon, RepeatIcon } from 'lucide-react';
import type { RouteOption } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ModeIcon } from '../ui/ModeIcon';
import { JourneyTimeline } from './JourneyTimeline';

interface RouteCardProps {
  route: RouteOption;
  selected?: boolean;
  onSelect?: () => void;
  onBook?: () => void;
}

const tagTone = (tag?: string) => {
  if (tag === 'Recommended') return 'cyan' as const;
  if (tag === 'Cheapest') return 'mint' as const;  if (tag === 'Fastest') return 'violet' as const;
  return 'neutral' as const;
};

export function RouteCard({ route, selected = false, onSelect, onBook }: RouteCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card as="li" padding="none" selected={selected} className="flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="flex flex-col gap-4 p-5 text-left transition-colors duration-150 ease-out hover:bg-white/[0.03]">
        
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                {route.name}
              </span>
              {route.tag && <Badge tone={tagTone(route.tag)}>{route.tag}</Badge>}
            </div>
            <p className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-semibold tracking-tight text-ink">{route.durationMin}</span>
              <span className="text-sm text-ink-muted">min</span>
              <span className="ml-2 font-mono text-[13px] text-ink-muted">
                {route.departs} → {route.arrives}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-semibold text-ink">{route.cost.toFixed(1)}</p>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink-dim">credits</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {route.legs.map((leg, i) =>
          <React.Fragment key={`${leg.label}-${i}`}>
              {i > 0 && <span className="text-ink-dim">›</span>}
              <span className="flex items-center gap-1.5 rounded-lg border border-hairline bg-surface-raised py-1 pl-1 pr-2.5">
                <ModeIcon mode={leg.mode} size="sm" />
                <span className="text-xs text-ink-muted">{leg.label.split('·')[0].trim()}</span>
              </span>
            </React.Fragment>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-hairline pt-4 sm:grid-cols-3">          
          <Metric icon={RepeatIcon} label="Transfers" value={String(route.transfers)} />
          <Metric icon={GaugeIcon} label="Reliability" value={`${route.reliability}%`} tint="#22D3EE" />
          <Metric icon={FootprintsIcon} label="Walking" value={route.walkingM === 0 ? 'None' : `${route.walkingM} m`} />
        </dl>
      </button>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-hairline bg-surface-raised/60 px-5 py-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          icon={
          <ChevronDownIcon
            aria-hidden
            className={`h-4 w-4 transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`} />

          }>
          
          {open ? 'Hide stages' : 'View stages'}
        </Button>
        <Button size="sm" className="ml-auto" variant={selected ? 'primary' : 'secondary'} onClick={onBook}>
          {selected ? 'Book this route' : 'Select'}
        </Button>
      </div>

      {open &&
      <div className="border-t border-hairline p-5">
          <JourneyTimeline legs={route.legs} />
        </div>
      }
    </Card>);

}

function Metric({
  icon: Icon,
  label,
  value,
  tint = '#94A3B8'





}: {icon: React.ElementType;label: string;value: string;tint?: string;}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-dim">
        <Icon aria-hidden className="h-3 w-3" style={{ color: tint }} />
        {label}
      </dt>
      <dd className="mt-1 text-[13px] font-medium text-ink">{value}</dd>
    </div>);

}