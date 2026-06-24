import React from 'react';

import { GhostMark } from './GhostMark';

import { useMeta } from '../hooks/useMeta';
import { useGhostrStore } from '../store/ghostrStore';

import { DURATION } from '../constants/animations';

/** Format an ISO timestamp as a compact local day + time label (e.g. `Jun 22, 9:17 AM`). */
function formatPollTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Persistent top bar: the ghostr wordmark on the left, and on the right a desktop-only
 * "last poll" stamp plus a "methodology" link that opens the methodology view.
 * @returns The top bar
 */
export const TopBar: React.FC = () => {
  const { meta } = useMeta();
  const openMethodology = useGhostrStore((s) => s.openMethodology);
  const closeMethodology = useGhostrStore((s) => s.closeMethodology);

  return (
    <header className="flex items-center justify-between border-b border-line-2" style={{ paddingTop: '22px', paddingBottom: '22px' }}>
      <GhostMark onClick={closeMethodology} />

      <div className="flex items-center gap-3 text-xs text-muted-3">
        {meta?.lastPolledAt && (
          <span className="hidden md:inline">last poll · {formatPollTime(meta.lastPolledAt)}</span>
        )}
        <button
          type="button"
          onClick={openMethodology}
          className={`transition-colors hover:text-ink md:border-line-2${
            meta?.lastPolledAt ? ' md:border-l md:pl-3' : ''
          }`}
          style={{ transitionDuration: `${DURATION.fast}ms` }}
        >
          methodology
        </button>
      </div>
    </header>
  );
};
