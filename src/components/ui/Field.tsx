import React, { useId } from 'react';
import { ChevronDownIcon } from 'lucide-react';

interface BaseProps {
  label: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

const shell =
'flex h-12 items-center gap-2.5 rounded-xl border bg-surface-raised px-3.5 transition-colors duration-150 ease-out focus-within:border-cyan-line';

export function TextField({
  label,
  hint,
  error,
  icon,
  className = '',
  ...rest
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </label>
      <div className={`${shell} ${error ? 'border-coral/60' : 'border-hairline'}`}>
        {icon && <span className="text-ink-dim">{icon}</span>}
        <input
          id={id}
          {...rest}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? `${id}-desc` : undefined}
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none" />
        
      </div>
      {(hint || error) &&
      <p id={`${id}-desc`} className={`mt-1.5 text-xs ${error ? 'text-coral' : 'text-ink-dim'}`}>
          {error || hint}
        </p>
      }
    </div>);

}

export function SelectField({
  label,
  hint,
  error,
  icon,
  className = '',
  children,
  ...rest
}: BaseProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </label>
      <div className={`${shell} relative ${error ? 'border-coral/60' : 'border-hairline'}`}>
        {icon && <span className="text-ink-dim">{icon}</span>}
        <select
          id={id}
          {...rest}
          className="w-full appearance-none bg-transparent pr-6 text-sm text-ink focus:outline-none [&>option]:bg-surface-raised">
          
          {children}
        </select>
        <ChevronDownIcon aria-hidden className="pointer-events-none absolute right-3.5 h-4 w-4 text-ink-dim" />
      </div>
      {(hint || error) &&
      <p className={`mt-1.5 text-xs ${error ? 'text-coral' : 'text-ink-dim'}`}>{error || hint}</p>
      }
    </div>);

}