import { Moon, RefreshCcw, Sun } from 'lucide-react';
import { type PropsWithChildren } from 'react';
import toast from 'react-hot-toast';
import { useDashboardStore } from '../../store/dashboardStore';

export function DashboardShell({ children }: PropsWithChildren) {
  const { theme, toggleTheme, refreshAll, iss, news } = useDashboardStore();

  const handleRefresh = async () => {
    await refreshAll();
    toast.success('Dashboard refreshed');
  };

  return (
    <main className="min-h-screen bg-app text-primary">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-none py-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">OrbitDesk</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              ISS Live Tracking, Space News & AI Console
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted sm:text-base">
              Real-time orbit telemetry, curated aerospace headlines, and a dashboard-bound assistant.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="primary-button" onClick={handleRefresh} disabled={iss.loading || news.loading}>
              <RefreshCcw size={16} className={iss.loading || news.loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
