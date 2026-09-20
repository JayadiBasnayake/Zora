import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SendIcon, SparklesIcon, XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orbitSuggestions, orbitThread } from '../../data/orbit';
import type { OrbitAction, OrbitMessage } from '../../types';
import { OrbitMessageBubble } from './OrbitMessageBubble';
import { useAppState } from '../../state/AppState';
import { useAuth } from '../../state/AuthState';
import { actionForIntent, resolveIntent } from '../../services/orbit';
import { getTimeGreeting } from '../../utils/datetime';

const messageId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return `orbit-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
};

export function OrbitDock({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const [thread, setThread] = useState<OrbitMessage[]>(orbitThread);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const { activeJourney, emergency, holdShuttle, keepJourney, dispatchEmergency } = useAppState();
  const { user } = useAuth();
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const contextRef = useRef({ activeJourney, emergency });
  contextRef.current = { activeJourney, emergency };
  const greetingThread = thread.map((message, index) => index === 0 && message.from === 'orbit' ? {
    ...message,
    body: message.body.replace(/^(Good morning|Good afternoon|Good evening),\s+[^.]+\./, `${getTimeGreeting()}, ${user?.fullName ?? 'traveller'}.`)
  } : message);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setThinking(false);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [thread, thinking, open]);

  const resolveReply = (text: string): OrbitMessage => {
    const current = contextRef.current;
    const resolution = resolveIntent(text, { hasJourney: Boolean(activeJourney), emergencyActive: emergency.active });    const actions = actionForIntent(resolution.intent);
    const id = messageId();
    if (resolution.intent === 'EMERGENCY') return { id, from: 'orbit', body: current.emergency.active ? 'Emergency assistance is already dispatched.' : 'I can send an emergency request using the same SOS flow as the floating button.', time: 'now', severity: 'warning', actions };
    if (!current.activeJourney) return { id, from: 'orbit', body: resolution.intent === 'UNKNOWN' ? 'I did not understand that request. Try one of the suggestions below.' : 'You do not have an active journey yet. I can help you plan your first journey.', time: 'now', severity: 'info', actions: resolution.intent === 'UNKNOWN' ? actionForIntent('PLAN_FIRST_JOURNEY') : actions };
    if (resolution.intent === 'CONNECTION_CHECK') {
      const safe = current.activeJourney.connection.bufferMin > current.activeJourney.connection.delayMin;
      return { id, from: 'orbit', body: safe ? `Yes, you have ${current.activeJourney.connection.bufferMin - current.activeJourney.connection.delayMin} minutes of buffer.` : 'At risk: your delay is larger than the connection buffer.', time: 'now', severity: safe ? 'positive' : 'warning', actions: safe ? [] : actionForIntent('DELAY') };
    }
    if (resolution.intent === 'HOLD_SHUTTLE') return { id, from: 'orbit', body: current.activeJourney.connection.shuttleHeld ? `Your shuttle is already held until ${current.activeJourney.connection.holdUntil}.` : 'I can hold the connecting shuttle for you.', time: 'now', severity: 'positive', actions: current.activeJourney.connection.shuttleHeld ? [] : actions };
    if (resolution.intent === 'DELAY') return { id, from: 'orbit', body: `${current.activeJourney.vehicle} is delayed by ${current.activeJourney.connection.delayMin} minutes. Your connection needs attention.`, time: 'now', severity: 'warning', actions };
    return { id, from: 'orbit', body: resolution.intent === 'UNKNOWN' ? 'I did not understand that request. Try one of the suggestions below.' : 'I found your journey context. Choose an action below and I will update the trip.', time: 'now', severity: 'info', actions };
  };

  const runAction = (action: OrbitAction) => {
    if (action === 'DISPATCH_SOS') dispatchEmergency('ORBIT emergency');
    if (action === 'OPEN_EMERGENCY') navigate('/emergency');
    if (action === 'PLAN_FIRST_JOURNEY') navigate('/plan');
    if (action === 'OPEN_JOURNEY') navigate('/trips/live');
    if (action === 'HOLD_SHUTTLE') holdShuttle();
    if (action === 'KEEP_JOURNEY') keepJourney();
  };

  const send = (text: string) => {
    const body = text.trim();
    if (!body || thinking) return;
    setThread((t) => [...t, { id: messageId(), from: 'user', body, time: 'now' }]);
    setDraft('');
    setThinking(true);
    timeoutRef.current = window.setTimeout(() => {
      try { setThread((t) => [...t, resolveReply(body)]); }
      finally { setThinking(false); timeoutRef.current = null; }
    }, 900);
  };

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[70] flex justify-end">
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 bg-[#020813]/70 backdrop-blur-sm"
          onClick={onClose} />
        
          <motion.aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="orbit-title"
          initial={{ x: 32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
          className="relative flex h-full w-full max-w-[420px] flex-col border-l border-hairline bg-surface">
          
            <header className="flex items-center gap-3 border-b border-hairline p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet/40 bg-violet-soft">
                <SparklesIcon aria-hidden className="h-5 w-5 text-violet" />
              </span>
              <div className="flex-1">
                <h2 id="orbit-title" className="font-display text-base font-semibold text-ink">ORBIT</h2>
                <p className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                  Watching your 08:40 to Kandy
                </p>
              </div>
              <button
              type="button"
              onClick={onClose}
              aria-label="Close assistant"
              className="rounded-lg p-1.5 text-ink-muted transition-colors duration-150 ease-out hover:bg-white/5 hover:text-ink">
              
                <XIcon aria-hidden className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {greetingThread.map((m) =>
            <OrbitMessageBubble key={m.id} message={m} onAction={runAction} />
            )}
              {thinking &&
            <div className="flex items-center gap-2 pl-11 text-xs text-ink-dim">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) =>
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-violet"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />

                )}
                  </span>
                  Checking the network
                </div>
            }
              <div ref={endRef} />
            </div>

            <div className="border-t border-hairline p-4">
              <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
                {orbitSuggestions.map((s) =>
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="shrink-0 rounded-full border border-hairline px-3 py-1.5 text-xs text-ink-muted transition-colors duration-150 ease-out hover:border-violet/40 hover:text-ink">
                
                    {s}
                  </button>
              )}
              </div>
              <form
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
              className="flex items-center gap-2 rounded-xl border border-hairline bg-surface-raised px-3 focus-within:border-violet/50">
              
                <label htmlFor="orbit-input" className="sr-only">
                  Ask ORBIT
                </label>
                <input
                id="orbit-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about your journey…"
                maxLength={500}
                className="h-12 w-full bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none" />
              
                <button
                type="submit"
                aria-label="Send message"
                disabled={!draft.trim()}
                className="rounded-lg p-2 text-violet transition-colors duration-150 ease-out hover:bg-violet-soft disabled:opacity-40">
                
                  <SendIcon aria-hidden className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}