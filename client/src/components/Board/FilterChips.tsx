import React from 'react';

import { useGhostrStore } from '../../store/ghostrStore';

import { DURATION } from '../../constants/animations';

import type { PostingFilter } from '../../types/posting';

const FILTERS: Array<{ value: PostingFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'old', label: 'Open 60d+' },
  { value: 'hidden', label: 'Salary hidden' },
  { value: 'reposted', label: 'Reposted 3×+' },
];

/**
 * Filter chips mapping to the API `filter` param. The active chip is inverted ink;
 * inactive chips are outlined. On mobile the row wraps to full width.
 * @returns The filter chip row
 */
export const FilterChips: React.FC = () => {
  const filter = useGhostrStore((s) => s.filter);
  const setFilter = useGhostrStore((s) => s.setFilter);

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => {
        const active = filter === f.value;
        return (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={active}
            className={`whitespace-nowrap border px-3 py-1.5 uppercase transition-colors ${
              active
                ? 'border-ink bg-ink text-black'
                : 'border-line-3 bg-transparent text-muted-2 hover:text-ink'
            }`}
            style={{ fontSize: '11px', letterSpacing: '0.06em', transitionDuration: `${DURATION.fast}ms` }}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
};
