import React from 'react';

import { ColumnHeader } from './ColumnHeader';
import { Controls } from './Controls';
import { EmptyState } from './EmptyState';
import { FirstPollPending } from './FirstPollPending';
import { Headline } from './Headline';
import { LoadMore } from './LoadMore';
import { PostingRow } from './PostingRow';
import { StatStrip } from './StatStrip';
import { Footer } from '../common/Footer';

import { useMeta } from '../../hooks/useMeta';
import { usePostings } from '../../hooks/usePostings';
import { useGhostrStore } from '../../store/ghostrStore';

import type { PostingRow as PostingRowData } from '../../types/posting';

/**
 * The live audit board: headline, stat strip, controls, posting list with expandable
 * detail, load-more pagination, and footer. Renders designed loading / empty /
 * error / first-poll-pending states.
 * @returns The board view
 */
export const BoardView: React.FC = () => {
  const query = useGhostrStore((s) => s.query);
  const filter = useGhostrStore((s) => s.filter);
  const sort = useGhostrStore((s) => s.sort);
  const visible = useGhostrStore((s) => s.visible);

  const { meta, loading: metaLoading } = useMeta();
  const { rows, matched, total, loading, error } = usePostings({ query, filter, sort, limit: visible });

  const firstPollPending = meta !== null && meta.lastPolledAt === null;
  const remaining = matched - rows.length;

  return (
    <div>
      <Headline />
      <StatStrip />
      <Controls />
      <ColumnHeader />

      <PostingList
        firstPollPending={firstPollPending}
        metaLoading={metaLoading}
        loading={loading}
        error={error}
        matched={matched}
        rows={rows}
      />

      {!loading && !error && !firstPollPending && matched > rows.length && (
        <LoadMore remaining={remaining} />
      )}

      <Footer counts={{ shown: rows.length, matched, total }} />
    </div>
  );
};

interface PostingListProps {
  /** True once meta resolves and no poll has ever run; takes precedence over every other state. */
  firstPollPending: boolean;
  /** Meta fetch still in flight; folded into the loading copy so the board never flashes empty. */
  metaLoading: boolean;
  /** Postings fetch in flight. */
  loading: boolean;
  error: string | null;
  matched: number;
  rows: PostingRowData[];
}

/** The list body and its loading / error / empty / first-poll states. */
const PostingList: React.FC<PostingListProps> = ({
  firstPollPending,
  metaLoading,
  loading,
  error,
  matched,
  rows,
}) => {
  if (firstPollPending) return <FirstPollPending />;

  if ((loading && rows.length === 0) || metaLoading) {
    return (
      <p className="py-20 text-center text-muted-6" style={{ fontSize: '13px' }}>
        reading the board…
      </p>
    );
  }

  if (error) {
    return (
      <p className="py-20 text-center text-muted-3" style={{ fontSize: '13px' }}>
        couldn't reach ghostr — {error.toLowerCase()}.
      </p>
    );
  }

  if (matched === 0) return <EmptyState />;

  return (
    <div>
      {rows.map((row) => (
        <PostingRow key={row.id} row={row} />
      ))}
    </div>
  );
};
