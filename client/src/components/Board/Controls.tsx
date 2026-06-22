import React from 'react';

import { FilterChips } from './FilterChips';

import { useGhostrStore } from '../../store/ghostrStore';

import type { PostingSort } from '../../types/posting';

const SORTS: Array<{ value: PostingSort; label: string }> = [
  { value: 'oldest', label: 'Longest open' },
  { value: 'reposted', label: 'Most reposted' },
  { value: 'newest', label: 'Newest first' },
];

/**
 * Controls row: a "/"-prefixed search input, filter chips, and a sort select.
 * On desktop they sit on one wrapping flex row; on mobile the sort and chips drop
 * to full-width below the search via flex order.
 * @returns The controls row
 */
export const Controls: React.FC = () => {
  const query = useGhostrStore((s) => s.query);
  const setQuery = useGhostrStore((s) => s.setQuery);
  const sort = useGhostrStore((s) => s.sort);
  const setSort = useGhostrStore((s) => s.setSort);

  return (
    <div className="flex flex-wrap items-center gap-4 py-5">
      <div className="relative order-1 min-w-0 flex-1 basis-full md:basis-0">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-6"
          aria-hidden="true"
        >
          /
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search company or role"
          aria-label="search company or role"
          className="w-full border border-line-3 bg-raised py-2.5 pl-7 pr-3 text-sm text-ink placeholder:text-muted-6 transition-colors focus:border-line-4"
        />
      </div>

      <div className="relative order-2 basis-full md:order-3 md:basis-auto">
        <label
          htmlFor="sort"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-6"
          style={{ fontSize: '11px' }}
        >
          sort
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as PostingSort)}
          className="w-full appearance-none border border-line-3 bg-raised py-2.5 pl-12 pr-9 text-sm text-ink transition-colors focus:border-line-4 md:w-auto"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-3"
          style={{ fontSize: '10px' }}
          aria-hidden="true"
        >
          ▼
        </span>
      </div>

      <div className="order-3 basis-full md:order-2 md:basis-auto">
        <FilterChips />
      </div>
    </div>
  );
};
