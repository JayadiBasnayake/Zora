import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, EyeIcon, EyeOffIcon, ShieldAlertIcon } from 'lucide-react';
import { useAuth } from '../state/AuthState';

export function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const next = new URLSearchParams(location.search).get('next');
  const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : '/';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try { await signIn(email, password, remember); navigate(safeNext, { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Email or password is incorrect'); }
    finally { setBusy(false); }
  };

  const tryDemo = () => { setEmail('demo@transport2100.city'); setPassword('Demo-Pass-2100!'); };

  return (
    <div className="min-h-screen bg-base px-4 py-8 text-ink sm:px-6">
      <header className="mx-auto flex max-w-[1100px] items-center justify-between">
        <Link to="/signin" aria-label="ZORA sign in"><img src="/Logo.jpeg" alt="ZORA" className="h-9 w-[120px] rounded object-cover object-center" /></Link>
        <Link to="/emergency" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-coral/40 bg-coral-soft px-3 text-sm font-semibold text-coral"><ShieldAlertIcon aria-hidden className="h-4 w-4" /> Emergency access</Link>
      </header>
      <main className="mx-auto grid max-w-[1100px] gap-6 py-12 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-center">
        <section className="rounded-3xl border border-hairline bg-surface p-6 shadow-panel sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan">Welcome back</p>
          <h1 className="mt-3 font-display text-3xl font-semibold">Sign in to your mobility account</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">Plan, book and track every journey in one place.</p>          <form onSubmit={submit} className="mt-7 space-y-4" aria-describedby={error ? 'signin-error' : undefined}>
            <label className="block text-sm font-medium">Email<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-hairline bg-surface-raised px-3 text-ink outline-none focus:border-cyan" /></label>
            <label className="block text-sm font-medium">Password<div className="mt-2 flex h-12 items-center rounded-xl border border-hairline bg-surface-raised focus-within:border-cyan"><input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-full min-w-0 flex-1 bg-transparent px-3 text-ink outline-none" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} className="p-3 text-ink-muted hover:text-ink">{showPassword ? <EyeOffIcon aria-hidden className="h-4 w-4" /> : <EyeIcon aria-hidden className="h-4 w-4" />}</button></div></label>
            <label className="flex items-center gap-2 text-sm text-ink-muted"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-cyan" />Remember me</label>
            {error && <p id="signin-error" role="alert" className="rounded-xl border border-coral/40 bg-coral-soft p-3 text-sm text-coral"><AlertTriangleIcon aria-hidden className="mr-2 inline h-4 w-4" />{error}</p>}
            <button disabled={busy} type="submit" className="min-h-12 w-full rounded-xl bg-cyan px-4 text-sm font-semibold text-[#03151f] disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm"><Link to="/forgot-password" className="text-cyan hover:underline">Forgot password?</Link><Link to="/register" className="text-cyan hover:underline">Create account</Link></div>
          <button type="button" onClick={tryDemo} className="mt-5 min-h-11 w-full rounded-xl border border-cyan-line bg-cyan-soft text-sm font-semibold text-cyan">Try the demo account</button>
          <p className="mt-3 text-center text-[11px] text-ink-dim">Demo: demo@transport2100.city · Demo-Pass-2100!</p>
        </section>
        <section className="hidden rounded-3xl border border-hairline bg-surface-raised/60 p-8 lg:block"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet">Citizen mobility system</p><h2 className="mt-3 max-w-lg font-display text-4xl font-semibold">Let the network handle the complexity.</h2><p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-muted">ORBIT watches your journey, your connections and the city network, then brings forward only what needs your attention.</p></section>
      </main>
    </div>
  );
}
