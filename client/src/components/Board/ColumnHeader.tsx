import React from 'react';

const COLUMNS = ['first seen', 'role & company', 'source', 'reposts', 'salary'];

/**
 * Desktop-only posting list column header. On mobile it collapses to a plain top border.
 * @returns The column header row
 */
export const ColumnHeader: React.FC = () => (
  <>
    {/* Mobile: just a top border. */}
    <div className="border-t border-line-2 md:hidden" />

    <div
      className="hidden border-y border-line-2 uppercase text-muted-6 md:grid"
      style={{
        gridTemplateColumns: '96px minmax(0, 1fr) 116px 92px 116px 34px',
        paddingTop: '10px',
        paddingBottom: '10px',
        fontSize: '11px',
        letterSpacing: '0.06em',
      }}
    >
      {COLUMNS.map((col) => (
        <span key={col}>{col}</span>
      ))}
      <span aria-hidden="true" />
    </div>
  </>
);
