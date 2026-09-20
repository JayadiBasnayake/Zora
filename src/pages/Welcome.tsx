import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2Icon, ShieldAlertIcon } from 'lucide-react';
import { useAuth } from '../state/AuthState';

export function Welcome() {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const finish = async () => { await completeOnboarding(); navigate('/', { replace: true }); };
  return (
    <div className="min-h-screen bg-base px-4 py-8 text-ink sm:px-6">
      <header className="mx-auto flex max-w-[900px] items-center justify-between"><img src="/zora-logo.svg" alt="ZORA" className="h-9 w-[120px] object-contain object-left" /><Link to="/emergency" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-coral/40 bg-coral-soft px-3 text-sm font-semibold text-coral"><ShieldAlertIcon aria-hidden className="h-4 w-4" /> SOS</Link></header>
      <main className="mx-auto max-w-[900px] py-16"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan">Step 1 of 6</p><div className="mt-3 h-2 rounded-full bg-surface-raised"><div className="h-full w-1/6 rounded-full bg-cyan" /></div><section className="mt-10 rounded-3xl border border-hairline bg-surface p-6 shadow-panel sm:p-10"><p className="text-sm text-ink-muted">Welcome, {user?.fullName}</p><h1 className="mt-2 font-display text-4xl font-semibold">Let’s set up your mobility profile.</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted">A few details help ORBIT make useful recommendations. You can skip the optional steps and finish them later.</p><ul className="mt-8 grid gap-3 sm:grid-cols-3"><li className="rounded-2xl border border-cyan-line bg-cyan-soft p-4"><CheckCircle2Icon className="h-5 w-5 text-cyan" /><p className="mt-3 text-sm font-semibold">Your routes</p><p className="mt-1 text-xs text-ink-muted">Plan journeys around your day.</p></li><li className="rounded-2xl border border-hairline bg-surface-raised p-4"><CheckCircle2Icon className="h-5 w-5 text-cyan" /><p className="mt-3 text-sm font-semibold">Your access</p><p className="mt-1 text-xs text-ink-muted">Make every transfer work for you.</p></li><li className="rounded-2xl border border-hairline bg-surface-raised p-4"><CheckCircle2Icon className="h-5 w-5 text-cyan" /><p className="mt-3 text-sm font-semibold">Your safety</p><p className="mt-1 text-xs text-ink-muted">Keep SOS close on every journey.</p></li></ul><div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={finish} className="min-h-12 rounded-xl bg-cyan px-5 text-sm font-semibold text-[#03151f]">Start with Home</button><button type="button" onClick={finish} className="min-h-12 rounded-xl border border-hairline px-5 text-sm font-medium text-ink-muted hover:text-ink">Skip for now</button></div></section></main>
    </div>
  );
}
