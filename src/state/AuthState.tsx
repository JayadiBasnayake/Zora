/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadUser, restoreSession, signIn as apiSignIn, signOut as apiSignOut, updateUser, type MockSession, type MockUser } from '../services/mockApi';

interface AuthStateValue {
  status: 'loading' | 'signedOut' | 'signedIn';
  user: MockUser | null;
  session: MockSession | null;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signOut: () => void;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthStateValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStateValue['status']>('loading');
  const [session, setSession] = useState<MockSession | null>(null);
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    restoreSession().then(async (restored) => {
      if (cancelled) return;
      if (!restored || restored.expiresAt <= Date.now()) { setStatus('signedOut'); return; }
      const restoredUser = await loadUser(restored.userId);
      if (cancelled) return;
      setSession(restored);
      setUser(restoredUser);
      setStatus(restoredUser ? 'signedIn' : 'signedOut');
    });
    return () => { cancelled = true; };
  }, []);

  const value = useMemo<AuthStateValue>(() => ({
    status,
    user,
    session,
    signIn: async (email, password, remember) => {
      const nextSession = await apiSignIn({ email, password, remember });
      const nextUser = await loadUser(nextSession.userId);
      setSession(nextSession);
      setUser(nextUser);
      setStatus('signedIn');
    },
    signOut: () => {
      apiSignOut();
      setSession(null);
      setUser(null);
      setStatus('signedOut');
    },
    completeOnboarding: async () => {
      if (!user) return;
      const updated = await updateUser(user.id, { onboardingComplete: true });
      setUser(updated);
    }
  }), [session, status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
