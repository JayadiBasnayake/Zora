import { Link, useLocation } from 'react-router-dom';

export function PublicInfo({ title }: { title: 'Terms' | 'Privacy' }) {
  return <div className="min-h-screen bg-base px-4 py-12 text-ink"><main className="mx-auto max-w-2xl rounded-3xl border border-hairline bg-surface p-6 sm:p-10"><Link to="/signin" className="font-display text-sm font-bold tracking-[0.14em]">TRANSPORT <span className="text-cyan">2100</span></Link><h1 className="mt-10 font-display text-3xl font-semibold">{title}</h1><p className="mt-4 text-sm leading-relaxed text-ink-muted">This prototype page describes the {title.toLowerCase()} for the simulated Transport 2100 account experience. No real payment, identity, location, or emergency service is connected.</p><Link to="/register" className="mt-8 inline-block text-sm text-cyan hover:underline">Back to registration</Link></main></div>;
}

export function ResetPassword() {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');
  return <div className="min-h-screen bg-base px-4 py-12 text-ink"><main className="mx-auto max-w-[440px] rounded-3xl border border-hairline bg-surface p-6 sm:p-8"><Link to="/signin" className="font-display text-sm font-bold tracking-[0.14em]">TRANSPORT <span className="text-cyan">2100</span></Link><h1 className="mt-10 font-display text-3xl font-semibold">Set a new password</h1><p className="mt-3 text-sm leading-relaxed text-ink-muted">{token ? 'This mock reset link is ready for a password update.' : 'A reset token is required to continue.'}</p>{token && <p className="mt-5 rounded-xl border border-amber/40 bg-amber-soft p-3 text-sm text-amber">Mock reset links expire after 15 minutes.</p>}<Link to="/signin" className="mt-8 inline-block text-sm text-cyan hover:underline">Return to sign in</Link></main></div>;
}
