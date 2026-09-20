import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState { return { hasError: true }; }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // MOCK: production error reporting would send diagnostics to a monitored backend.
    void _error;
    void _info;
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return <main className="flex min-h-screen items-center justify-center bg-base px-4 text-ink"><section className="max-w-md rounded-2xl border border-hairline bg-surface p-6 text-center"><h1 className="font-display text-2xl font-semibold">ZORA needs a moment</h1><p className="mt-2 text-sm text-ink-muted">Something went wrong. Emergency assistance is still available.</p><div className="mt-5 flex justify-center gap-2"><a href="/emergency" className="rounded-xl bg-coral px-4 py-3 text-sm font-semibold text-[#2a0710]">Open emergency help</a><button type="button" onClick={() => window.location.reload()} className="rounded-xl border border-hairline px-4 py-3 text-sm text-ink-muted">Reload</button></div></section></main>;
  }
}
