import React from 'react';

import { GhostGlyph } from '../common/GhostGlyph';

/**
 * Shown before the first poll has run (meta.lastPolledAt === null), when the board
 * has no observed history yet.
 * @returns The first-poll-pending state
 */
export const FirstPollPending: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
    <GhostGlyph size={56} className="opacity-60" />
    <h2 className="font-display font-extrabold text-ink" style={{ fontSize: '20px' }}>
      first poll pending
    </h2>
    <p className="max-w-sm text-muted-3" style={{ fontSize: '13px', lineHeight: 1.6 }}>
      ghostr hasn't completed its first poll yet. Once it reads the public ATS feeds, every
      tracked posting and its true age will appear here.
    </p>
  </div>
);
