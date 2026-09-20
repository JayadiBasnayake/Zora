import React from 'react';
import { Loader2Icon } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  icon?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
  'bg-cyan text-[#03151f] font-semibold border border-transparent hover:bg-[#67e8f9] active:bg-[#22d3ee]',
  secondary:
  'bg-surface-raised text-ink border border-hairline hover:border-cyan-line hover:bg-surface-high',
  ghost: 'bg-transparent text-ink-muted border border-transparent hover:text-ink hover:bg-white/5',
  danger: 'bg-coral text-[#2a0710] font-semibold border border-transparent hover:bg-[#fda4af]',
  quiet: 'bg-white/5 text-ink border border-hairline hover:bg-white/10'
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-14 px-6 text-base gap-2.5 rounded-xl'
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  block = false,
  icon,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
      'inline-flex items-center justify-center whitespace-nowrap font-medium',
      'transition-[background-color,border-color,color,transform] duration-150 ease-out',
      'active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45',
      variants[variant],
      sizes[size],
      block ? 'w-full' : '',
      className].
      join(' ')}>
      
      {loading ?
      <Loader2Icon aria-hidden className="h-4 w-4 animate-spin" /> :

      icon
      }
      {children}
    </button>);

}