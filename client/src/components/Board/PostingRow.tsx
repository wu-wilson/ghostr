import React from 'react';

import { PostingDetail } from './PostingDetail';

import { useGhostrStore } from '../../store/ghostrStore';

import { ageInDays, formatAge } from '../../lib/audit';
import { capitalizeSource } from '../../lib/format';

import type { PostingRow as PostingRowData } from '../../types/posting';

interface PostingRowProps {
  row: PostingRowData;
}

/** Small uppercase micro-label shown above a value on mobile only. */
const Micro: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className="mb-1 block uppercase text-muted-6 md:hidden"
    style={{ fontSize: '9px', letterSpacing: '0.08em' }}
  >
    {children}
  </span>
);

/**
 * One clickable posting row. Click toggles the expanded detail panel. The desktop layout
 * is a six-column grid; mobile reflows into a stacked grid-areas block with micro-labels.
 * @param props - The posting to render
 * @returns The row plus its detail panel when expanded
 */
export const PostingRow: React.FC<PostingRowProps> = ({ row }) => {
  const expandedId = useGhostrStore((s) => s.expandedId);
  const toggleExpanded = useGhostrStore((s) => s.toggleExpanded);
  const expanded = expandedId === row.id;

  const age = formatAge(ageInDays(row.firstSeenOn));

  return (
    <div className="border-b border-line-1">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => toggleExpanded(row.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded(row.id);
          }
        }}
        className="ghostr-row cursor-pointer gap-x-4 gap-y-3.5 md:gap-0"
      >
        {/* age */}
        <div className="self-start md:self-center" style={{ gridArea: 'a', paddingTop: '18px', paddingBottom: '18px' }}>
          <Micro>first seen</Micro>
          <span className="font-display font-extrabold text-ink" style={{ fontSize: '21px' }}>
            {age}
          </span>
        </div>

        {/* role + company */}
        <div className="min-w-0 self-start md:self-center" style={{ gridArea: 't', paddingTop: '18px' }}>
          <div className="truncate font-medium text-ink" style={{ fontSize: '15px' }}>
            {row.role}
          </div>
          <div className="mt-0.5 truncate text-muted-3" style={{ fontSize: '12px' }}>
            {row.company}
            {row.department ? ` · ${row.department}` : ''}
          </div>
        </div>

        {/* source */}
        <div className="self-start md:self-center" style={{ gridArea: 's' }}>
          <Micro>source</Micro>
          <span className="text-muted-2" style={{ fontSize: '12px' }}>
            {capitalizeSource(row.source)}
          </span>
        </div>

        {/* reposts */}
        <div className="self-start md:self-center" style={{ gridArea: 'r' }}>
          <Micro>reposts</Micro>
          <span
            className={`font-display font-bold ${row.repostCount > 0 ? 'text-ink' : 'text-muted-6'}`}
            style={{ fontSize: '17px' }}
          >
            {row.repostCount > 0 ? `${row.repostCount}×` : '—'}
          </span>
        </div>

        {/* salary */}
        <div className="self-start md:self-center" style={{ gridArea: 'y' }}>
          <Micro>salary</Micro>
          <span
            className={`uppercase ${row.salaryText ? 'text-muted-2' : 'text-ink'}`}
            style={{ fontSize: '13px' }}
          >
            {row.salaryText ? 'listed' : 'withheld'}
          </span>
        </div>

        {/* chevron */}
        <div
          className="self-start justify-self-end text-muted-6 md:self-center"
          style={{ gridArea: 'c', fontSize: '16px', paddingTop: '18px' }}
          aria-hidden="true"
        >
          {expanded ? '–' : '+'}
        </div>
      </div>

      {expanded && <PostingDetail row={row} />}
    </div>
  );
};
