import { SparklesIcon } from 'lucide-react';
import type { OrbitAction, OrbitMessage } from '../../types';
import { Button } from '../ui/Button';

interface OrbitMessageBubbleProps {
  message: OrbitMessage;
  onAction?: (action: OrbitAction) => void;
}

const severityFrame: Record<string, string> = {
  info: 'border-hairline bg-surface-raised',
  warning: 'border-amber/30 bg-amber-soft',
  positive: 'border-mint/30 bg-mint-soft'
};

export function OrbitMessageBubble({ message, onAction }: OrbitMessageBubbleProps) {
  if (message.from === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md border border-cyan-line bg-cyan-soft px-3.5 py-2.5">
          <p className="text-[13px] leading-relaxed text-ink">{message.body}</p>
          <p className="mt-1 text-right font-mono text-[10px] text-ink-dim">{message.time}</p>
        </div>
      </div>);

  }

  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet/40 bg-violet-soft">
        <SparklesIcon aria-hidden className="h-4 w-4 text-violet" />
      </span>
      <div className={`min-w-0 flex-1 rounded-2xl rounded-tl-md border px-3.5 py-2.5 ${severityFrame[message.severity ?? 'info']}`}>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-violet">ORBIT</p>
        <p className="text-[13px] leading-relaxed text-ink">{message.body}</p>
        {message.actions &&
        <div className="mt-3 flex flex-wrap gap-2">
            {message.actions.map((a, i) =>
          <Button
            key={a.action}
            size="sm"
            variant={i === 0 ? 'primary' : 'quiet'}
            onClick={() => onAction?.(a.action)}>
            
                {a.label}
              </Button>
          )}
          </div>
        }
        <p className="mt-2 font-mono text-[10px] text-ink-dim">{message.time}</p>
      </div>
    </div>);

}