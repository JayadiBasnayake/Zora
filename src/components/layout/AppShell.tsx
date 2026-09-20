import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangleIcon,
  MapIcon,
  MenuIcon,
  MoonIcon,
  RadioIcon,
  RouteIcon,
  ShieldAlertIcon,
  SparklesIcon,
  TicketIcon,
  SunIcon,
  XIcon } from
'lucide-react';
import { OrbitDock } from '../orbit/OrbitDock';
import { useAppState } from '../../state/AppState';
import { useAuth } from '../../state/AuthState';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

const primaryNav: NavItem[] = [
{ to: '/plan', label: 'Plan Journey', icon: RouteIcon },
{ to: '/live', label: 'Live Map', icon: MapIcon },
{ to: '/trips', label: 'My Trips', icon: TicketIcon }];


const mobileNav: NavItem[] = [
{ to: '/plan', label: 'Plan', icon: RouteIcon },
{ to: '/live', label: 'Live', icon: MapIcon },
{ to: '/trips', label: 'Trips', icon: TicketIcon }];


const secondaryNav: NavItem[] = [
{ to: '/trips/live', label: 'Live Journey Tracking', icon: RadioIcon },
{ to: '/emergency', label: 'Emergency', icon: ShieldAlertIcon }];


export function AppShell({ children }: {children: React.ReactNode;}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [orbitOpen, setOrbitOpen] = useState(false);
  const [sosConfirm, setSosConfirm] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const sosPanelRef = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.localStorage.getItem('transport-theme') === 'light' ? 'light' : 'dark';
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { emergency, dispatchEmergency } = useAppState();
  const closeOrbit = useCallback(() => setOrbitOpen(false), []);

  useEffect(() => {
    if (!sosConfirm) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setSosConfirm(false); return; }
      if (event.key !== 'Tab' || !sosPanelRef.current) return;
      const focusable = Array.from(sosPanelRef.current.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    sosPanelRef.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [sosConfirm]);

  useEffect(() => {
    window.localStorage.setItem('transport-theme', theme);
  }, [theme]);

  return (
    <div className={`${theme === 'light' ? 'theme-light' : ''} flex min-h-screen w-full flex-col bg-base text-ink`}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-cyan focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#102A43]">
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-hairline bg-base/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center" aria-label="ZORA home">
            <img src="/zora-logo.svg" alt="ZORA" className="h-9 w-[120px] object-contain object-left" />
          </Link>

          <nav aria-label="Primary" className="ml-4 hidden items-center gap-0.5 lg:flex">
            {primaryNav.map((item) =>
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
              [
              'rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150 ease-out',
              isActive ? 'bg-surface-raised text-ink shadow-sm' : 'text-ink-muted hover:bg-surface-raised hover:text-ink'].
              join(' ')
              }>
                {item.label}
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
              className="rounded-xl border border-hairline bg-surface-raised p-2 text-ink-muted transition-colors duration-150 ease-out hover:border-cyan-line hover:text-ink">
              {theme === 'dark' ? <SunIcon aria-hidden className="h-4.5 w-4.5" /> : <MoonIcon aria-hidden className="h-4.5 w-4.5" />}
            </button>

            <button
              type="button"
              onClick={() => setOrbitOpen(true)}
              className="hidden items-center gap-2 rounded-xl border border-violet/40 bg-violet-soft px-3 py-2 text-[13px] font-semibold text-violet transition-colors duration-150 ease-out hover:bg-violet/15 sm:inline-flex">
              <SparklesIcon aria-hidden className="h-4 w-4" />
              ORBIT
            </button>

            <Link
              to="/emergency"
              className="inline-flex items-center gap-1.5 rounded-xl border border-coral/40 bg-coral-soft px-2.5 py-2 text-[13px] font-semibold text-coral transition-colors duration-150 ease-out hover:bg-coral/15">
              <ShieldAlertIcon aria-hidden className="h-4 w-4" />
              <span className="hidden sm:inline">SOS</span>
            </Link>


            <div className="relative hidden md:block">
            <button
              type="button"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              onClick={() => setAccountOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-surface-raised py-1.5 pl-2 pr-3 text-left transition-colors duration-150 ease-out hover:border-cyan-line">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-high font-display text-xs font-bold text-cyan">
                {user?.fullName.charAt(0) ?? '?'}
              </span>
              <span className="text-left leading-tight">
                <span className="block max-w-28 truncate text-[13px] font-medium text-ink">{user?.fullName ?? 'Account'}</span>
                <span className="block font-mono text-[10px] text-ink-dim">{user?.passId ?? 'Mobility account'}</span>
              </span>
            </button>
            {accountOpen && <div role="menu" className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-hairline bg-surface p-2 shadow-panel">
              <div className="border-b border-hairline px-3 py-2"><p className="truncate text-sm font-semibold text-ink">{user?.fullName}</p><p className="mt-0.5 truncate text-xs text-ink-muted">{user?.email}</p></div>
              <button type="button" role="menuitem" onClick={() => { setAccountOpen(false); navigate('/profile'); }} className="mt-1 flex w-full rounded-xl px-3 py-2.5 text-left text-sm text-ink-muted hover:bg-surface-raised hover:text-ink">Profile</button>
              <button type="button" role="menuitem" onClick={() => { setAccountOpen(false); signOut(); navigate('/signin', { replace: true }); }} className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm text-coral hover:bg-coral-soft">Sign out</button>
            </div>}
            </div>

            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-xl border border-hairline bg-surface-raised p-2 text-ink-muted transition-colors duration-150 ease-out hover:text-ink lg:hidden">
              {menuOpen ? <XIcon aria-hidden className="h-4.5 w-4.5" /> : <MenuIcon aria-hidden className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {menuOpen &&
        <div className="border-t border-hairline bg-surface lg:hidden">
            <nav aria-label="All sections" className="mx-auto grid w-full max-w-[1600px] gap-1 px-4 py-3 sm:px-6">
              {[...primaryNav, ...secondaryNav].map((item) =>
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
              [
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150 ease-out',
              isActive ? 'bg-cyan-soft text-cyan' : 'text-ink-muted hover:bg-surface-raised hover:text-ink'].
              join(' ')
              }>
                  <item.icon aria-hidden className="h-4 w-4" />
                  {item.label}
                </NavLink>
            )}
              <button type="button" onClick={() => { setMenuOpen(false); signOut(); navigate('/signin', { replace: true }); }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-coral hover:bg-coral-soft">Sign out</button>
            </nav>
          </div>
        }
      </header>

      <main id="main" className="flex-1 pb-20 lg:pb-24">
        {children}
      </main>

      <button
        type="button"
        aria-label={emergency.active ? 'Emergency active, open emergency status' : 'Open emergency assistance'}
        onClick={() => setSosConfirm(true)}
        className="fixed bottom-24 right-4 z-40 flex min-h-12 items-center gap-2 rounded-full border border-coral/50 bg-coral px-4 py-3 text-xs font-bold text-[#2a0710] shadow-panel transition-transform duration-150 ease-out hover:-translate-y-0.5 lg:bottom-8 lg:right-6">
        <AlertTriangleIcon aria-hidden className="h-4 w-4" />
        {emergency.active ? 'SOS active' : 'SOS'}
      </button>

      {sosConfirm &&
      <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#020813]/70 p-4 backdrop-blur-sm sm:items-center">
        <section
          ref={sosPanelRef}
          tabIndex={-1}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="sos-title"
          className="w-full max-w-sm rounded-2xl border border-coral/45 bg-surface p-5 shadow-panel">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-coral-soft text-coral">
              <AlertTriangleIcon aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 id="sos-title" className="font-display text-lg font-semibold text-ink">
                {emergency.active ? 'Emergency assistance is active' : 'Need emergency assistance?'}
              </h2>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                {emergency.active ? `Help is approaching in ${emergency.eta}. Your location is shared with responders.` : 'Your current location and journey will be shared with responders.'}
              </p>
            </div>
          </div>
          {emergency.active ?
          <div className="mt-4 rounded-xl border border-hairline bg-surface-raised p-3 text-[13px] text-ink">
            Dispatched · {emergency.location} · {emergency.vehicle}
          </div> : null}
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={() => setSosConfirm(false)} className="flex-1 rounded-xl border border-hairline px-3 py-2.5 text-sm font-medium text-ink-muted hover:text-ink">
              Cancel
            </button>
            {!emergency.active &&
            <button type="button" onClick={() => { dispatchEmergency('General emergency'); setSosConfirm(false); }} className="flex-1 rounded-xl bg-coral px-3 py-2.5 text-sm font-semibold text-[#2a0710]">
              Send for help
            </button>}
          </div>
        </section>
      </div>}

      <nav
        aria-label="Quick access"
        className="fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-1 rounded-2xl border border-hairline bg-base/85 p-1.5 shadow-panel backdrop-blur-xl lg:flex">
        {secondaryNav.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
              'flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] transition-colors duration-150 ease-out',
              active ? 'bg-cyan-soft text-cyan' : 'text-ink-muted hover:bg-surface-raised hover:text-ink'].
              join(' ')}>
              <item.icon aria-hidden className="h-4 w-4" />
              {item.label}
            </Link>);
        })}
      </nav>

      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-hairline bg-base/90 backdrop-blur-xl lg:hidden">
        {mobileNav.map((item) =>
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
          [
          'flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors duration-150 ease-out',
          isActive ? 'text-cyan' : 'text-ink-dim'].
          join(' ')
          }>
            <item.icon aria-hidden className="h-5 w-5" />
            {item.label}
          </NavLink>
        )}
        <button
          type="button"
          onClick={() => setOrbitOpen(true)}
          className="flex min-w-0 flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-violet">
          <SparklesIcon aria-hidden className="h-5 w-5" />
          ORBIT
        </button>
      </nav>

      <OrbitDock open={orbitOpen} onClose={closeOrbit} />
    </div>);

}