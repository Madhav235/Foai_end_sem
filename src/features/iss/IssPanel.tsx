import { RefreshCcw, UserRound } from 'lucide-react';
import { useMemo } from 'react';
import { useIssPolling } from '../../hooks/useIssPolling';
import { useDashboardStore } from '../../store/dashboardStore';
import { IssMap } from './IssMap';
import { Skeleton } from '../../components/shared/Skeleton';

export function IssPanel() {
  useIssPolling();
  const { iss, refreshIss } = useDashboardStore();
  const updatedAt = iss.lastUpdated ? new Date(iss.lastUpdated).toLocaleTimeString() : 'Waiting';
  const crew = useMemo(() => iss.astronauts.map((person) => person.name).join(', '), [iss.astronauts]);

  return (
    <section className="panel min-h-[620px] overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-soft p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-kicker">Live orbit</p>
          <h2 className="section-title">International Space Station</h2>
          <p className="mt-2 text-sm text-muted">Updated every 15 seconds. Last update: {updatedAt}</p>
        </div>
        <button className="secondary-button" onClick={() => void refreshIss()} disabled={iss.loading}>
          <RefreshCcw size={16} className={iss.loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <IssMap />
        <aside className="grid content-start gap-4">
          {iss.loading && !iss.current ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-40" />
            </>
          ) : (
            <>
              <Metric label="Latitude" value={iss.current ? iss.current.latitude.toFixed(5) : '--'} />
              <Metric label="Longitude" value={iss.current ? iss.current.longitude.toFixed(5) : '--'} />
              <Metric
                label="Nearest region"
                value={iss.nearestLocation}
                helper={`${iss.history.length} tracked positions`}
              />
              <div className="rounded-lg border border-soft bg-soft p-4">
                <div className="flex items-center gap-2">
                  <UserRound size={18} className="text-accent" />
                  <h3 className="font-semibold">Astronauts aboard ISS</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {crew || 'Crew manifest unavailable from the live source.'}
                </p>
              </div>
              {iss.error ? (
                <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                  {iss.error}
                </div>
              ) : null}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}

function Metric({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-lg border border-soft bg-soft p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
      {helper ? <p className="mt-1 text-xs text-muted">{helper}</p> : null}
    </div>
  );
}
