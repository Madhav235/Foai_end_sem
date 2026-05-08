import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

export function useNews() {
  const refreshNews = useDashboardStore((state) => state.refreshNews);

  useEffect(() => {
    const controller = new AbortController();
    void refreshNews({ signal: controller.signal });

    return () => controller.abort();
  }, [refreshNews]);
}
