import React from 'react';

import { useGhostrStore } from '../../store/ghostrStore';

import { DURATION } from '../../constants/animations';
import { PAGE_SIZE } from '../../constants/config';

interface LoadMoreProps {
  /** Postings remaining beyond what's currently shown. */
  remaining: number;
}

/**
 * Centered "load more" button. Reveals the next page (up to PAGE_SIZE more rows).
 * @param props - Count of postings still hidden
 * @returns The load-more control
 */
export const LoadMore: React.FC<LoadMoreProps> = ({ remaining }) => {
  const loadMore = useGhostrStore((s) => s.loadMore);
  const next = Math.min(PAGE_SIZE, remaining);

  return (
    <div className="flex justify-center py-7">
      <button
        type="button"
        onClick={loadMore}
        className="border border-line-4 bg-transparent px-5 py-2.5 uppercase text-ink transition-colors hover:border-ink hover:bg-ink/[0.06]"
        style={{ fontSize: '12px', letterSpacing: '0.12em', transitionDuration: `${DURATION.fast}ms` }}
      >
        load {next} more ↓
      </button>
    </div>
  );
};
