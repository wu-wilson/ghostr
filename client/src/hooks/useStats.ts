import { useEffect, useState } from 'react';

import { API_URL } from '../constants/config';

import type { Stats } from '../types/posting';

interface UseStatsResult {
  stats: Stats | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetch headline figures from `GET /api/stats` once on mount.
 * @returns The stats payload (null until resolved) plus loading/error state
 */
export function useStats(): UseStatsResult {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/stats`);
        if (!response.ok) {
          throw new Error(`Failed to load stats (${response.status})`);
        }
        const data = (await response.json()) as Stats;
        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load stats');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
}
