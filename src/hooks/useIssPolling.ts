import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

export function useIssPolling() {
  const refreshIss = useDashboardStore((state) => state.refreshIss);
  const refreshAstronauts = useDashboardStore((state) => state.refreshAstronauts);

  useEffect(() => {
    const controller = new AbortController();
    void refreshIss({ signal: controller.signal });
    void refreshAstronauts(controller.signal);

    const issTimer = window.setInterval(() => {
      void refreshIss({ silent: true });
    }, 15000);

    const crewTimer = window.setInterval(() => {
      void refreshAstronauts();
    }, 10 * 60 * 1000);

    return () => {
      controller.abort();
      window.clearInterval(issTimer);
      window.clearInterval(crewTimer);
    };
  }, [refreshAstronauts, refreshIss]);
}
