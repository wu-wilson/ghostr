import { useEffect, useState } from 'react';

import { API_URL } from '../constants/config';

import type { Meta } from '../types/posting';

interface UseMetaResult {
  meta: Meta | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetch poll metadata from `GET /api/meta` once on mount. `lastPolledAt` is null
 * before the first poll, which drives the board's "first poll pending" state.
 * @returns The meta payload (null until resolved) plus loading/error state
 */
export function useMeta(): UseMetaResult {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMeta(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/meta`);
        if (!response.ok) {
          throw new Error(`Failed to load meta (${response.status})`);
        }
        const data = (await response.json()) as Meta;
        if (!cancelled) {
          setMeta(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load meta');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  return { meta, loading, error };
}
