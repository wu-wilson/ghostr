import React from 'react';

import { useStats } from '../../hooks/useStats';

import { formatCount, formatPercent } from '../../lib/format';

interface StatCell {
  value: string;
  label: string;
}

/** Placeholder dash shown in each cell while stats load. */
const PENDING = '—';

/**
 * Live stat strip: companies polled, postings tracked, median age, and reposted share.
 * Two columns on mobile, four on desktop. Each row's leading cell sits flush with the page edge; interior
 * cells are padded on both sides so text clears the column dividers.
 * @returns The stat strip section
 */
export const StatStrip: React.FC = () => {
  const { stats } = useStats();

  const cells: StatCell[] = [
    {
      value: stats ? formatCount(stats.companiesPolled) : PENDING,
      label: 'companies polled',
    },
    {
      value: stats ? formatCount(stats.postingsTracked) : PENDING,
      label: 'postings tracked',
    },
    {
      value: stats ? `${stats.medianAgeDays}d` : PENDING,
      label: 'median age · live',
    },
    {
      value: stats ? formatPercent(stats.repostRate) : PENDING,
      label: 'reposted ≥ once',
    },
  ];

  return (
    <section className="grid grid-cols-2 border-b border-line-2 md:grid-cols-4">
      {cells.map((cell, index) => {
        // Leading cell of each row (left column) stays flush with the page edge; others get left padding.
        const isRowStartMobile = index % 2 === 0;
        const padLeft = `${isRowStartMobile ? 'pl-0' : 'pl-4'} ${index === 0 ? 'md:pl-0' : 'md:pl-4'}`;
        // Divider between columns: left column on mobile (2-col); all but the last on desktop (4-col).
        const divider = `${isRowStartMobile ? 'border-r border-line-1' : ''} ${index === 1 ? 'md:border-r md:border-line-1' : ''}`;

        return (
          <div key={cell.label} className={`py-5 pr-4 ${padLeft} ${divider}`}>
            <div
              className="font-display font-extrabold text-ink"
              style={{ fontSize: 'clamp(25px, 6.5vw, 32px)' }}
            >
              {cell.value}
            </div>
            <div
              className="mt-1 uppercase text-muted-3"
              style={{ fontSize: '11px', letterSpacing: '0.1em' }}
            >
              {cell.label}
            </div>
          </div>
        );
      })}
    </section>
  );
};
