import React from 'react';

export type Tone = 'cyan' | 'violet' | 'mint' | 'amber' | 'coral' | 'neutral';

const tones: Record<Tone, string> = {
  cyan: 'bg-cyan-soft text-cyan border-cyan-line',
  violet: 'bg-violet-soft text-violet border-violet/40',
  mint: 'bg-mint-soft text-mint border-mint/35',
  amber: 'bg-amber-soft text-amber border-amber/35',
  coral: 'bg-coral-soft text-coral border-coral/35',
  neutral: 'bg-white/5 text-ink-muted border-hairline'
};

interface BadgeProps {
  tone?: Tone;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ tone = 'neutral', dot = false, pulse = false, className = '', children }: BadgeProps) {
  return (
    <span
      className={[
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
      'text-[11px] font-semibold uppercase tracking-[0.08em]',
      tones[tone],
      className].
      join(' ')}>
      
      {dot &&
      <span className="relative flex h-1.5 w-1.5">
          {pulse &&
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        }
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      }
      {children}
    </span>);

}