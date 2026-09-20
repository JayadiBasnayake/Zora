
interface ProgressProps {
  value: number;
  label?: string;
  valueLabel?: string;
  color?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function Progress({
  value,
  label,
  valueLabel,
  color = '#22D3EE',
  size = 'md',
  className = ''
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      {(label || valueLabel) &&
      <div className="mb-2 flex items-baseline justify-between gap-3">
          {label && <span className="text-[13px] text-ink-muted">{label}</span>}
          {valueLabel && <span className="font-mono text-[13px] text-ink">{valueLabel}</span>}
        </div>
      }
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={`w-full overflow-hidden rounded-full bg-white/10 ${size === 'sm' ? 'h-1.5' : 'h-2'}`}>
        
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }} />
        
      </div>
    </div>);

}

interface DonutProps {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
}

export function Donut({ value, max = 100, label, sublabel, color = '#22D3EE', size = 132 }: DonutProps) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.16)" strokeWidth={8} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            className="transition-[stroke-dashoffset] duration-300 ease-out" />
          
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-semibold text-ink">{label}</span>
          {sublabel && <span className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-ink-dim">{sublabel}</span>}
        </div>
      </div>
    </div>);

}