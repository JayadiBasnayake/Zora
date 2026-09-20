import React from 'react';

interface StatProps {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  trend?: {direction: 'up' | 'down';value: string;good?: boolean;};
  icon?: React.ReactNode;
  className?: string;
}

export function Stat({ label, value, unit, hint, trend, icon, className = '' }: StatProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-ink-dim">{icon}</span>}
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{label}</span>
      </div>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-2xl font-semibold tracking-tight text-ink">{value}</span>
        {unit && <span className="text-[13px] text-ink-muted">{unit}</span>}
        {trend &&
        <span className={`ml-0.5 text-xs font-semibold ${trend.good === false ? 'text-coral' : 'text-mint'}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </span>
        }
      </p>
      {hint && <p className="mt-1 text-xs text-ink-dim">{hint}</p>}
    </div>);

}