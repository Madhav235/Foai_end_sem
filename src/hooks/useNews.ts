import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

export function useNews() {
  const refreshNews = useDashboardStore((state) => state.refreshNews);

  useEffect(() => {
    void refreshNews();
  }, [refreshNews]);
}
