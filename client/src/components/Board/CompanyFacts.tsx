import React from 'react';

import { useCompanyFacts } from '../../hooks/useCompanyFacts';

import { formatCount, formatPercent } from '../../lib/format';

import type { PostingRow } from '../../types/posting';

interface CompanyFactsProps {
  row: PostingRow;
}

/** One label/value fact row, separated from the previous by a hairline. */
const FactRow: React.FC<{ label: string; value: string; first?: boolean }> = ({
  label,
  value,
  first,
}) => (
  <div
    className={`flex items-center justify-between py-2 ${first ? '' : 'border-t border-line-1'}`}
  >
    <span className="text-muted-3" style={{ fontSize: '12px' }}>
      {label}
    </span>
    <span className="text-ink" style={{ fontSize: '12px' }}>
      {value}
    </span>
  </div>
);

/**
 * The company-facts column. Aggregates are fetched lazily from `GET /api/companies/:id/facts`
 * when the row expands; a small loading line shows while it resolves.
 * @param props - The posting whose company facts to show
 * @returns The company-facts column body
 */
export const CompanyFacts: React.FC<CompanyFactsProps> = ({ row }) => {
  const { facts, loading, error } = useCompanyFacts(row.companyId);

  return (
    <div>
      <div className="uppercase text-muted-6" style={{ fontSize: '11px', letterSpacing: '0.06em' }}>
        {row.company} · observed
      </div>

      <div className="mt-3">
        {loading && (
          <p className="text-muted-3" style={{ fontSize: '12px' }}>
            loading facts…
          </p>
        )}

        {!loading && error && (
          <p className="text-muted-3" style={{ fontSize: '12px' }}>
            facts unavailable
          </p>
        )}

        {!loading && !error && facts && (
          <>
            <FactRow label="roles tracked" value={formatCount(facts.rolesTracked)} first />
            <FactRow label="currently open" value={formatCount(facts.currentlyOpen)} />
            <FactRow label="reposted ≥ once" value={formatPercent(facts.repostRate)} />
            <FactRow label="salary on this listing" value={row.salaryText ?? 'withheld'} />
          </>
        )}
      </div>
    </div>
  );
};
