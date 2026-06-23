import { Pool, QueryResult } from 'pg';

import { config } from './config';
import type { AtsSource } from './adapters';

/** Single shared connection pool. The cron is a short-lived one-shot, so `max: 1` suffices. */
const pool = new Pool({ connectionString: config.databaseUrl, max: 1 });

/** An active company row to poll. */
export interface CompanyRow {
  /** Company surrogate id. */
  id: number;
  /** Display name. */
  name: string;
  /** ATS provider. */
  source: AtsSource;
  /** Provider board token. */
  boardToken: string;
}

/**
 * Run a parameterized query against the pool.
 * @param text - SQL with `$1`, `$2`, ... placeholders; never interpolate input
 * @param params - Values bound to the placeholders, in order
 * @returns The unwrapped driver result; read `.rows` for the selected records
 */
export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  return pool.query(text, params);
}

/**
 * Load every active company, ordered by id for deterministic runs.
 * @returns The active companies to poll
 */
export async function loadActiveCompanies(): Promise<CompanyRow[]> {
  const result = await query(
    `SELECT id, name, source, board_token
       FROM companies
      WHERE is_active = true
      ORDER BY id`,
  );
  return result.rows.map((row) => ({
    id: row.id as number,
    name: row.name as string,
    source: row.source as AtsSource,
    boardToken: row.board_token as string,
  }));
}

/**
 * Resolve the `job_id` for a newly appearing `external_id` by repost linking: reuse the
 * most recent listing for the same `(company_id, match_key)` that is still open or closed
 * within the repost window; otherwise create a fresh job.
 * @param companyId - The company the listing belongs to
 * @param matchKey - The normalized match key
 * @returns The resolved (existing or newly created) job id
 */
export async function resolveJobId(companyId: number, matchKey: string): Promise<number> {
  const existing = await query(
    `SELECT job_id
       FROM listings
      WHERE company_id = $1
        AND match_key = $2
        AND (closed_on IS NULL OR closed_on >= CURRENT_DATE - $3::int)
      ORDER BY last_seen_on DESC, id DESC
      LIMIT 1`,
    [companyId, matchKey, config.repostWindowDays],
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].job_id as number;
  }

  const created = await query(
    'INSERT INTO jobs (company_id) VALUES ($1) RETURNING id',
    [companyId],
  );
  return created.rows[0].id as number;
}

/** Mutable + identity fields for a listing upsert. */
export interface UpsertListingInput {
  /** Owning company id. */
  companyId: number;
  /** Resolved job id (used only on insert). */
  jobId: number;
  /** Provider-stable external id. */
  externalId: string;
  /** Role title. */
  title: string;
  /** Department, or null. */
  department: string | null;
  /** Location, or null. */
  location: string | null;
  /** Normalized match key (set only on insert; immutable thereafter). */
  matchKey: string;
  /** Display salary string, or null. */
  salaryText: string | null;
}

/**
 * Upsert a listing keyed on `(company_id, external_id)`. On insert, anchors
 * `first_seen_on`/`last_seen_on` to `CURRENT_DATE` and leaves `closed_on` NULL. On conflict,
 * bumps `last_seen_on`, reopens (`closed_on = NULL`), and refreshes mutable fields. `match_key`
 * and `job_id` are never moved after insert (a job's age must trace to its original listing).
 * @param input - The listing to persist
 * @returns Resolves once the row is written
 */
export async function upsertListing(input: UpsertListingInput): Promise<void> {
  await query(
    `INSERT INTO listings
       (company_id, job_id, external_id, title, department, location, match_key, salary_text,
        first_seen_on, last_seen_on)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, CURRENT_DATE)
     ON CONFLICT (company_id, external_id) DO UPDATE SET
       last_seen_on = CURRENT_DATE,
       closed_on    = NULL,
       title        = EXCLUDED.title,
       department   = EXCLUDED.department,
       location     = EXCLUDED.location,
       salary_text  = EXCLUDED.salary_text,
       updated_at   = now()`,
    [
      input.companyId,
      input.jobId,
      input.externalId,
      input.title,
      input.department,
      input.location,
      input.matchKey,
      input.salaryText,
    ],
  );
}

/**
 * Close out a company's listings that were open but absent from the latest successful feed:
 * any `closed_on IS NULL AND last_seen_on < CURRENT_DATE` becomes `closed_on = CURRENT_DATE`.
 * @param companyId - The company whose listings to close out
 * @returns Resolves once the close-out completes
 */
export async function closeOutCompany(companyId: number): Promise<void> {
  await query(
    `UPDATE listings
        SET closed_on = CURRENT_DATE,
            updated_at = now()
      WHERE company_id = $1
        AND closed_on IS NULL
        AND last_seen_on < CURRENT_DATE`,
    [companyId],
  );
}

/**
 * Append one `poll_runs` row recording the outcome of a completed run.
 * @param companiesPolled - Companies whose feed was fetched successfully
 * @param listingsSeen - Total listings across all successful feeds
 * @param errors - Number of companies whose feed failed
 * @returns Resolves once the row is written
 */
export async function writePollRun(
  companiesPolled: number,
  listingsSeen: number,
  errors: number,
): Promise<void> {
  await query(
    `INSERT INTO poll_runs (companies_polled, listings_seen, errors)
     VALUES ($1, $2, $3)`,
    [companiesPolled, listingsSeen, errors],
  );
}

/**
 * Close the connection pool. Call once at process shutdown.
 * @returns Resolves once the pool has drained
 */
export async function closePool(): Promise<void> {
  await pool.end();
}
