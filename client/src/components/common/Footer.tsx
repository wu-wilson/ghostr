import React from 'react';

import { GitHubLink } from './GitHubLink';

import { useGhostrStore } from '../../store/ghostrStore';

import { formatCount } from '../../lib/format';

import { DURATION } from '../../constants/animations';

interface FooterProps {
  /** When set, the footer shows the board's "showing X of Y" line on the left. */
  counts?: { shown: number; matched: number; total: number };
  /** When true, the left side is a "← back to board" control instead. */
  backToBoard?: boolean;
}

/**
 * Shared page footer. Left side is either the board's match summary or a "back to board"
 * control; right side is always the GitHub source link.
 * @param props - Either `counts` (board) or `backToBoard` (methodology)
 * @returns The footer row
 */
export const Footer: React.FC<FooterProps> = ({ counts, backToBoard }) => {
  const closeMethodology = useGhostrStore((s) => s.closeMethodology);

  return (
    <footer className="flex flex-col gap-3 border-t border-line-2 py-7 text-xs text-muted-6 md:flex-row md:items-center md:justify-between">
      {backToBoard ? (
        <button
          type="button"
          onClick={closeMethodology}
          className="self-start uppercase tracking-wider text-muted-3 transition-colors hover:text-ink"
          style={{ letterSpacing: '0.1em', transitionDuration: `${DURATION.fast}ms` }}
        >
          ← back to board
        </button>
      ) : (
        <p className="max-w-xl">
          {counts
            ? `showing ${formatCount(counts.shown)} of ${formatCount(counts.matched)} matches · ${formatCount(counts.total)} tracked — narrow with search or filters`
            : null}
        </p>
      )}
      <GitHubLink />
    </footer>
  );
};
