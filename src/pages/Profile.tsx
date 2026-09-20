import { Link } from 'react-router-dom';
import { UserCircleIcon } from 'lucide-react';
import { useAuth } from '../state/AuthState';
import { Card } from '../components/ui/Card';
import { SectionHeading } from '../components/ui/SectionHeading';

export function Profile() {
  const { user } = useAuth();
  return <div className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6"><SectionHeading title="My profile" description="Your identity details used across the ZORA mobility network." /><Card padding="lg" className="mt-6"><div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-line bg-cyan-soft text-cyan"><UserCircleIcon aria-hidden className="h-7 w-7" /></span><div><h2 className="font-display text-xl font-semibold text-ink">{user?.fullName}</h2><p className="text-sm text-ink-muted">{user?.email}</p></div></div><dl className="mt-6 grid gap-4 border-t border-hairline pt-6 sm:grid-cols-2"><div><dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-dim">Mobility pass</dt><dd className="mt-1 font-mono text-sm text-ink">{user?.passId}</dd></div><div><dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-dim">Account status</dt><dd className="mt-1 text-sm text-mint">Active</dd></div></dl><Link to="/" className="mt-6 inline-block text-sm text-cyan hover:underline">Back to Home</Link></Card></div>;
}
