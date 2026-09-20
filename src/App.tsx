import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { Planner } from './pages/Planner';
import { LiveNetwork } from './pages/LiveNetwork';
import { Trips } from './pages/Trips';
import { Tracking } from './pages/Tracking';
import { Emergency } from './pages/Emergency';
import { AppStateProvider } from './state/AppState';
import { AuthProvider, useAuth } from './state/AuthState';
import { SignIn } from './pages/SignIn';
import { Welcome } from './pages/Welcome';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { PublicInfo, ResetPassword } from './pages/PublicInfo';
import { Profile } from './pages/Profile';

interface AppProps {
  
  /** Let ORBIT surface disruption alerts on its own, rather than waiting to be asked. */
  proactiveOrbit?: boolean;
}

export function App({ proactiveOrbit = true }: AppProps) {  
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppStateProvider>
          <AppRoutes proactiveOrbit={proactiveOrbit} />
        </AppStateProvider>
      </AuthProvider>
    </BrowserRouter>);
}

function AppRoutes({ proactiveOrbit }: Required<AppProps>) {
  const { status, user } = useAuth();
  if (status === 'loading') return <LoadingScreen />;
  return <Routes>
    <Route path="/signin" element={status === 'signedIn' ? <Navigate to="/" replace /> : <SignIn />} />
    <Route path="/register" element={status === 'signedIn' ? <Navigate to="/" replace /> : <Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/terms" element={<PublicInfo title="Terms" />} />
    <Route path="/privacy" element={<PublicInfo title="Privacy" />} />
    <Route path="/emergency" element={<Emergency />} />
    <Route path="/welcome" element={status === 'signedIn' ? <Welcome /> : <Navigate to="/signin?next=%2Fwelcome" replace />} />
    <Route path="*" element={status === 'signedIn' ? user?.onboardingComplete ? <AppShell><ProtectedRoutes proactiveOrbit={proactiveOrbit} /></AppShell> : <Navigate to="/welcome" replace /> : <Navigate to={`/signin?next=${encodeURIComponent(window.location.pathname)}`} replace />} />  </Routes>;
}

function ProtectedRoutes({ proactiveOrbit }: Required<AppProps>) {  
  return <Routes>
    <Route path="/" element={<Home proactiveOrbit={proactiveOrbit} />} />    <Route path="/plan" element={<Planner />} />
    <Route path="/live" element={<LiveNetwork />} />
    <Route path="/trips" element={<Trips proactiveOrbit={proactiveOrbit} />} />
    <Route path="/trips/live" element={<Tracking />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

function LoadingScreen() {
  return <div className="flex min-h-screen items-center justify-center bg-base text-ink"><p className="font-display text-sm tracking-[0.16em] text-cyan">TRANSPORT 2100 · RESTORING SESSION</p></div>;
}