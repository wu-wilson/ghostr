/** ATS provider a posting was observed on. */
export type PostingSource = 'greenhouse' | 'lever' | 'ashby';

/** Filter applied to the board, mapped to the API `filter` query param. */
export type PostingFilter = 'all' | 'old' | 'hidden' | 'reposted';

/** Sort applied to the board, mapped to the API `sort` query param. */
export type PostingSort = 'oldest' | 'reposted' | 'newest';

/**
 * One posting (a job aggregated from its listings) as returned by `GET /api/postings`.
 * The record sentence, tag pills, and timeline are derived client-side from these fields.
 */
export interface PostingRow {
  /** Job id; the expand toggle key. */
  id: number;
  /** Owning company id; used for the lazy company-facts fetch. */
  companyId: number;
  company: string;
  source: PostingSource;
  role: string;
  department: string | null;
  /** Date ghostr first observed this posting ('YYYY-MM-DD'); the true-age anchor. */
  firstSeenOn: string;
  repostCount: number;
  /** First-seen date of each relist ('YYYY-MM-DD'), oldest to newest. */
  repostDates: string[];
  isOpen: boolean;
  /** Disclosed salary string, or null when withheld. */
  salaryText: string | null;
}

/** Response shape of `GET /api/postings`. */
export interface PostingsResponse {
  rows: PostingRow[];
  /** Postings passing the active search + filter. */
  matched: number;
  /** All open postings (the board universe). */
  total: number;
}

/** Response shape of `GET /api/stats`. */
export interface Stats {
  companiesPolled: number;
  postingsTracked: number;
  medianAgeDays: number;
  /** Share of postings reposted at least once, as a 0..1 fraction. */
  repostRate: number;
}

/** Response shape of `GET /api/meta`. */
export interface Meta {
  /** ISO timestamp of the latest poll, or null before the first run. */
  lastPolledAt: string | null;
}

/** Response shape of `GET /api/companies/:id/facts`. */
export interface CompanyFacts {
  rolesTracked: number;
  currentlyOpen: number;
  /** Share of the company's postings reposted at least once, as a 0..1 fraction. */
  repostRate: number;
}
