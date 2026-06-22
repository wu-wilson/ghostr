import { useEffect, useState } from 'react';

import { API_URL } from '../constants/config';

import type { PostingFilter, PostingRow, PostingsResponse, PostingSort } from '../types/posting';

interface UsePostingsResult {
  rows: PostingRow[];
  /** Postings passing the active search + filter. */
  matched: number;
  /** All open postings (the board universe). */
  total: number;
  loading: boolean;
  error: string | null;
}

interface UsePostingsArgs {
  query: string;
  filter: PostingFilter;
  sort: PostingSort;
  /** Number of rows to request (page size × pages loaded). */
  limit: number;
}

/**
 * Fetch board postings from `GET /api/postings`, refetching whenever the query,
 * filter, sort, or limit changes. The server paginates from offset 0, so `limit`
 * grows with "load more" and always returns the full visible window.
 * @param args - Active search query, filter, sort, and row limit
 * @returns Rows plus matched/total counts and loading/error state
 */
export function usePostings({ query, filter, sort, limit }: UsePostingsArgs): UsePostingsResult {
  const [rows, setRows] = useState<PostingRow[]>([]);
  const [matched, setMatched] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPostings(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          filter,
          sort,
          limit: String(limit),
          offset: '0',
        });
        if (query.trim() !== '') {
          params.set('search', query.trim());
        }

        const response = await fetch(`${API_URL}/api/postings?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Failed to load postings (${response.status})`);
        }

        const data = (await response.json()) as PostingsResponse;
        if (!cancelled) {
          setRows(data.rows);
          setMatched(data.matched);
          setTotal(data.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load postings');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPostings();
    return () => {
      cancelled = true;
    };
  }, [query, filter, sort, limit]);

  return { rows, matched, total, loading, error };
}
