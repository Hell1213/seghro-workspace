import { useEffect, useCallback, useRef } from 'react';

/**
 * Periodically refetches data only when the browser tab is visible.
 *
 * @param fetchFn - Async function to call on each interval tick
 * @param intervalMs - Interval in milliseconds (default 30000)
 */
export function useAutoRefresh(
  fetchFn: () => Promise<void>,
  intervalMs: number = 30000,
) {
  const fetchRef = useRef(fetchFn);

  const tick = useCallback(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      fetchRef.current();
    }
  }, []);

  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    // Run immediately once
    tick();

    const id = setInterval(tick, intervalMs);

    // Also refetch when the tab becomes visible again
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchRef.current();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs, tick]);
}
