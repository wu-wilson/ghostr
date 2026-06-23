import React, { useMemo } from 'react';

import { timelineModel } from '../../lib/audit';

import type { PostingRow } from '../../types/posting';

interface RepostTimelineProps {
  row: PostingRow;
}

/**
 * The repost-timeline column: a horizontal track with a tick per relist positioned by its
 * real first-seen date, two endpoint dots, axis labels, and a one-line summary.
 * @param props - The posting whose relist history to plot
 * @returns The timeline column body
 */
export const RepostTimeline: React.FC<RepostTimelineProps> = ({ row }) => {
  const model = useMemo(() => timelineModel(row), [row]);

  return (
    <div>
      <div className="relative" style={{ height: '24px' }}>
        {/* center line */}
        <div className="absolute left-0 right-0 top-1/2 bg-line-3" style={{ height: '1px' }} />

        {/* relist ticks — inset so they sit between the endpoint dots, never under them */}
        <div className="absolute inset-y-0" style={{ left: '13px', right: '13px' }}>
          {model.ticks.map((tick, index) => (
            <div
              key={index}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-muted-1"
              style={{ left: `${tick.leftPct}%`, width: '2px', height: '15px' }}
            />
          ))}
        </div>

        {/* endpoint dots */}
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-page"
          style={{ width: '10px', height: '10px', border: '1.5px solid rgb(var(--muted-3))' }}
        />
        <span
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-page"
          style={{ width: '10px', height: '10px', border: '1.5px solid rgb(var(--line-4))' }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-muted-3" style={{ fontSize: '10px' }}>
        <span>{model.firstLabel}</span>
        <span>now</span>
      </div>

      <p className="mt-3 text-muted-1" style={{ fontSize: '12px' }}>
        {model.summary}
      </p>
    </div>
  );
};
