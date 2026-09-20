import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlertIcon } from 'lucide-react';
import { register } from '../services/mockApi';
import { useAuth } from '../state/AuthState';

export function Register() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '', terms: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const validPassword = form.password.length >= 10;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (!validPassword || form.password !== form.confirm || !form.terms) { setError('Use a password of at least 10 characters, confirm it, and accept the terms.'); return; }
    setBusy(true);
    try { await register({ fullName: form.fullName, email: form.email, password: form.password, acceptedTerms: form.terms }); await signIn(form.email, form.password, true); navigate('/welcome', { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'We could not create your account.'); }
    finally { setBusy(false); }
  };
  return <div className="min-h-screen bg-base px-4 py-8 text-ink sm:px-6"><header className="mx-auto flex max-w-[520px] items-center justify-between"><Link to="/signin" className="font-display text-sm font-bold tracking-[0.14em]">TRANSPORT <span className="text-cyan">2100</span></Link><Link to="/emergency" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-coral/40 bg-coral-soft px-3 text-sm font-semibold text-coral"><ShieldAlertIcon className="h-4 w-4" /> SOS</Link></header><main className="mx-auto max-w-[520px] py-10"><section className="rounded-3xl border border-hairline bg-surface p-6 shadow-panel sm:p-8"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan">Create account</p><h1 className="mt-3 font-display text-3xl font-semibold">Start your citizen profile</h1><form onSubmit={submit} className="mt-7 space-y-4" aria-describedby={error ? 'register-error' : undefined}><label className="block text-sm font-medium">Full name<input required autoComplete="name" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-hairline bg-surface-raised px-3 outline-none focus:border-cyan" /></label><label className="block text-sm font-medium">Email<input required type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-hairline bg-surface-raised px-3 outline-none focus:border-cyan" /></label><label className="block text-sm font-medium">Password<input required type="password" autoComplete="new-password" value={form.password} onChange={(e) => update('password', e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-hairline bg-surface-raised px-3 outline-none focus:border-cyan" /></label><ul className="rounded-xl border border-hairline bg-surface-raised p-3 text-xs text-ink-muted"><li className={validPassword ? 'text-mint' : ''}>{validPassword ? '✓' : '○'} At least 10 characters</li><li className={form.password === form.confirm && form.confirm ? 'text-mint' : ''}>{form.password === form.confirm && form.confirm ? '✓' : '○'} Passwords match</li></ul><label className="block text-sm font-medium">Confirm password<input required type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => update('confirm', e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-hairline bg-surface-raised px-3 outline-none focus:border-cyan" /></label><label className="flex items-start gap-2 text-sm text-ink-muted"><input required type="checkbox" checked={form.terms} onChange={(e) => update('terms', e.target.checked)} className="mt-1 h-4 w-4 accent-cyan" /><span>I accept the <Link to="/terms" className="text-cyan hover:underline">Terms</Link> and <Link to="/privacy" className="text-cyan hover:underline">Privacy Policy</Link>.</span></label>{error && <p id="register-error" role="alert" className="rounded-xl border border-coral/40 bg-coral-soft p-3 text-sm text-coral">{error}</p>}<button disabled={busy} type="submit" className="min-h-12 w-full rounded-xl bg-cyan font-semibold text-[#03151f] disabled:opacity-50">{busy ? 'Creating account…' : 'Create account'}</button></form><p className="mt-5 text-center text-sm text-ink-muted">Already registered? <Link to="/signin" className="text-cyan hover:underline">Sign in</Link></p></section></main></div>;
}
