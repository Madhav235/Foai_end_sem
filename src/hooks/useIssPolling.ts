import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

const ISS_POLL_MS = 30000;
const CREW_POLL_MS = 10 * 60 * 1000;

let subscribers = 0;
let issTimer: number | null = null;
let crewTimer: number | null = null;
let controller: AbortController | null = null;
let stopTimer: number | null = null;

export function useIssPolling() {
  const refreshIss = useDashboardStore((state) => state.refreshIss);
  const refreshAstronauts = useDashboardStore((state) => state.refreshAstronauts);

  useEffect(() => {
    subscribers += 1;
    if (stopTimer) {
      window.clearTimeout(stopTimer);
      stopTimer = null;
    }

    if (!issTimer) {
      controller = new AbortController();
      void refreshIss({ signal: controller.signal, silent: true });
      void refreshAstronauts(controller.signal);

      issTimer = window.setInterval(() => {
        void refreshIss({ silent: true });
      }, ISS_POLL_MS);

      crewTimer = window.setInterval(() => {
        void refreshAstronauts();
      }, CREW_POLL_MS);
    }

    return () => {
      subscribers = Math.max(0, subscribers - 1);
      stopTimer = window.setTimeout(() => {
        if (subscribers > 0) return;
        controller?.abort();
        controller = null;
        if (issTimer) window.clearInterval(issTimer);
        if (crewTimer) window.clearInterval(crewTimer);
        issTimer = null;
        crewTimer = null;
      }, 1000);
    };
  }, [refreshAstronauts, refreshIss]);
}
