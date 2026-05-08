import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';

type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Application error boundary caught:', error, info);
    }
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-app p-6 text-primary">
        <section className="panel max-w-lg p-6 text-center">
          <h1 className="text-2xl font-semibold">Something went sideways</h1>
          <p className="mt-3 text-sm text-muted">
            {import.meta.env.DEV && this.state.message ? this.state.message : 'Please reload the dashboard.'}
          </p>
          <button className="primary-button mx-auto mt-5" onClick={() => window.location.reload()}>
            Reload dashboard
          </button>
        </section>
      </main>
    );
  }
}
