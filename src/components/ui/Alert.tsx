import React from 'react';
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, OctagonAlertIcon } from 'lucide-react';

type Severity = 'info' | 'warning' | 'positive' | 'critical';

const config: Record<Severity, {icon: React.ElementType;frame: string;tint: string;}> = {
  info: { icon: InfoIcon, frame: 'border-hairline bg-surface-raised', tint: 'text-cyan' },
  warning: { icon: AlertTriangleIcon, frame: 'border-amber/30 bg-amber-soft', tint: 'text-amber' },
  positive: { icon: CheckCircle2Icon, frame: 'border-mint/30 bg-mint-soft', tint: 'text-mint' },
  critical: { icon: OctagonAlertIcon, frame: 'border-coral/35 bg-coral-soft', tint: 'text-coral' }
};

interface AlertProps {
  severity?: Severity;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function Alert({ severity = 'info', title, children, actions, className = '' }: AlertProps) {
  const { icon: Icon, frame, tint } = config[severity];
  return (
    <div
      role={severity === 'critical' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-xl border p-4 ${frame} ${className}`}>
      
      <Icon aria-hidden className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${tint}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {children && <div className="mt-1 text-[13px] leading-relaxed text-ink-muted">{children}</div>}
        {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>);

}