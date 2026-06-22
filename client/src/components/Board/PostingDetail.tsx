import React from 'react';

import { CompanyFacts } from './CompanyFacts';
import { RepostTimeline } from './RepostTimeline';

import { recordSentence, tagPills } from '../../lib/audit';

import type { PostingRow } from '../../types/posting';

interface PostingDetailProps {
  row: PostingRow;
}

/** Small uppercase section label shared across the three detail columns. */
const ColumnLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="uppercase text-muted-6" style={{ fontSize: '11px', letterSpacing: '0.06em' }}>
    {children}
  </div>
);

/**
 * Expanded detail panel for a posting: the generated record sentence + tag pills,
 * the repost timeline, and lazily-loaded company facts. Three columns on desktop,
 * stacked on mobile, beneath a dashed top border.
 * @param props - The expanded posting
 * @returns The detail panel
 */
export const PostingDetail: React.FC<PostingDetailProps> = ({ row }) => {
  const pills = tagPills(row);

  return (
    <div
      className="animate-detail-in -mt-px grid gap-x-9 gap-y-8 py-7 md:grid-cols-[1fr_1.3fr_0.9fr]"
      style={{ borderTop: '1px dashed rgb(var(--line-2))' }}
    >
      {/* the record */}
      <div>
        <ColumnLabel>the record</ColumnLabel>
        <p className="mt-3 text-muted-1" style={{ fontSize: '14px', lineHeight: 1.7 }}>
          {recordSentence(row)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {pills.map((pill) => (
            <span
              key={pill}
              className="border border-line-3 px-2 py-1 uppercase text-muted-2"
              style={{ fontSize: '10px', letterSpacing: '0.05em' }}
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* repost timeline */}
      <div>
        <ColumnLabel>repost timeline</ColumnLabel>
        <div className="mt-4">
          <RepostTimeline row={row} />
        </div>
      </div>

      {/* company facts */}
      <CompanyFacts row={row} />
    </div>
  );
};
