import React from 'react';

import { GhostGlyph } from '../common/GhostGlyph';

/**
 * Shown when the active search + filters match no postings.
 * @returns The empty state
 */
export const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
    <GhostGlyph size={52} className="opacity-60" />
    <p className="text-muted-6" style={{ fontSize: '13px' }}>
      no postings match — nothing to show here.
    </p>
  </div>
);
