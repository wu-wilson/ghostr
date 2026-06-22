import { useEffect, useState } from 'react';

import { API_URL } from '../constants/config';

import type { CompanyFacts } from '../types/posting';

interface UseCompanyFactsResult {
  facts: CompanyFacts | null;
  loading: boolean;
  error: string | null;
}

/**
 * Lazily fetch per-company aggregates from `GET /api/companies/:id/facts`.
 * Called when a posting row expands; refetches if the company id changes.
 * @param companyId - The company whose facts to load
 * @returns The facts payload (null until resolved) plus loading/error state
 */
export function useCompanyFacts(companyId: number): UseCompanyFactsResult {
  const [facts, setFacts] = useState<CompanyFacts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchFacts(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/companies/${companyId}/facts`);
        if (!response.ok) {
          throw new Error(`Failed to load company facts (${response.status})`);
        }
        const data = (await response.json()) as CompanyFacts;
        if (!cancelled) {
          setFacts(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load company facts');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchFacts();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  return { facts, loading, error };
}
