import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/mockApi';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (busy) return; setBusy(true); await forgotPassword(email); setSent(true); setBusy(false); };
  return <div className="min-h-screen bg-base px-4 py-8 text-ink"><main className="mx-auto max-w-[440px] py-16"><Link to="/signin" className="font-display text-sm font-bold tracking-[0.14em]">TRANSPORT <span className="text-cyan">2100</span></Link><section className="mt-8 rounded-3xl border border-hairline bg-surface p-6 shadow-panel sm:p-8"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan">Account recovery</p><h1 className="mt-3 font-display text-3xl font-semibold">Reset your password</h1><p className="mt-2 text-sm leading-relaxed text-ink-muted">Enter your email and we will send a reset link if an account exists.</p>{sent ? <p role="status" className="mt-6 rounded-xl border border-cyan-line bg-cyan-soft p-4 text-sm text-ink">If an account exists, a reset link was sent.</p> : <form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-medium">Email<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-hairline bg-surface-raised px-3 outline-none focus:border-cyan" /></label><button disabled={busy} className="min-h-12 w-full rounded-xl bg-cyan font-semibold text-[#03151f] disabled:opacity-50">{busy ? 'Sending…' : 'Send reset link'}</button></form>}<Link to="/signin" className="mt-6 block text-center text-sm text-cyan hover:underline">Back to sign in</Link></section></main></div>;
}
