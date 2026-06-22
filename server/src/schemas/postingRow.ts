/** The ATS providers ghostr polls. Mirrors the `ats_source` Postgres enum. */
export type AtsSource = 'greenhouse' | 'lever' | 'ashby';

/**
 * One row of the audit board — a `postings`-view row joined to its company, in camelCase.
 * Dates are emitted as `YYYY-MM-DD` strings; `repostDates` holds each relist's first-seen date.
 * The record sentence, tag pills, and timeline are derived client-side from these fields.
 */
export interface PostingRow {
  /** Job id — stable across relists; used for the expand toggle. */
  id: number;
  /** Owning company's id; used for the lazy company-facts fetch. */
  companyId: number;
  company: string;
  source: AtsSource;
  role: string;
  department: string | null;
  /** True-age anchor: the date ghostr first observed this posting (`YYYY-MM-DD`). */
  firstSeenOn: string;
  repostCount: number;
  /** Each relist's first-seen date (`YYYY-MM-DD`), oldest first; empty when never reposted. */
  repostDates: string[];
  isOpen: boolean;
  /** Disclosed salary string, or `null` when withheld. */
  salaryText: string | null;
}

/** Response body for `GET /api/postings`. */
export interface PostingsResponse {
  rows: PostingRow[];
  /** Count of open postings passing search + filter. */
  matched: number;
  /** Count of all open postings (the board universe). */
  total: number;
}
