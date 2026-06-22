/** Board route: GET /api/postings — the live audit board over the `postings` view joined to companies. */
import { Router } from 'express';

import { PostingsQuerySchema } from '../schemas/postingsQuery';
import { query } from '../services/db';

import type { PostingsQuery } from '../schemas/postingsQuery';
import type { AtsSource, PostingRow, PostingsResponse } from '../schemas/postingRow';

const router = Router();

/** Age threshold (days) for the `old` filter — a posting open this long or longer. */
const OLD_AGE_DAYS = 60;
/** Repost-count threshold for the `reposted` filter. */
const REPOSTED_MIN = 3;

/** ORDER BY clause per sort key — each carries a stable `id` tiebreak so paging can't skip or dupe. */
const SORT_CLAUSES: Record<PostingsQuery['sort'], string> = {
  oldest: 'p.first_seen_on ASC, p.id ASC',
  reposted: 'p.repost_count DESC, p.id ASC',
  newest: 'p.first_seen_on DESC, p.id ASC',
};

/**
 * Build the parameterized WHERE conditions shared by the count and page queries.
 * Always scopes to open postings; appends search (ILIKE on company name or role) and the active filter.
 * @param params - Validated query params
 * @returns SQL fragments (joined with ` AND `) plus the ordered bind values for `$N` placeholders
 */
function buildConditions(params: PostingsQuery): { clauses: string[]; values: unknown[] } {
  const clauses: string[] = ['p.is_open'];
  const values: unknown[] = [];

  if (params.search) {
    values.push(`%${params.search}%`);
    clauses.push(`(c.name ILIKE $${values.length} OR p.role ILIKE $${values.length})`);
  }

  if (params.filter === 'old') {
    values.push(OLD_AGE_DAYS);
    clauses.push(`current_date - p.first_seen_on >= $${values.length}`);
  } else if (params.filter === 'hidden') {
    clauses.push('p.salary_text IS NULL');
  } else if (params.filter === 'reposted') {
    values.push(REPOSTED_MIN);
    clauses.push(`p.repost_count >= $${values.length}`);
  }

  return { clauses, values };
}

/**
 * Map a raw joined `postings`/`companies` row to the camelCase `PostingRow` contract.
 * Coerces date columns to `YYYY-MM-DD` strings and `repost_dates` to a string array.
 * @param row - Raw row from pg (snake_case columns, dates already formatted to text by the query)
 * @returns The client-facing posting row
 */
function toPostingRow(row: Record<string, unknown>): PostingRow {
  const repostDates = Array.isArray(row.repost_dates)
    ? (row.repost_dates as unknown[]).map((d) => String(d))
    : [];

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    company: String(row.company),
    source: row.source as AtsSource,
    role: String(row.role),
    department: row.department === null ? null : String(row.department),
    firstSeenOn: String(row.first_seen_on),
    repostCount: Number(row.repost_count),
    repostDates,
    isOpen: Boolean(row.is_open),
    salaryText: row.salary_text === null ? null : String(row.salary_text),
  };
}

router.get('/postings', async (req, res, next) => {
  try {
    const parsed = PostingsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      console.error(`Invalid postings query: ${JSON.stringify(parsed.error.issues)}`);
      res.status(400).json({ error: 'Invalid query parameters' });
      return;
    }
    const params = parsed.data;

    // total = the open-postings universe, independent of search/filter.
    const totalResult = await query(
      'SELECT COUNT(*)::int AS count FROM postings p WHERE p.is_open',
    );
    const total = totalResult.rows[0].count as number;

    const { clauses, values } = buildConditions(params);
    const where = clauses.join(' AND ');

    const matchedResult = await query(
      `SELECT COUNT(*)::int AS count
       FROM postings p
       JOIN companies c ON c.id = p.company_id
       WHERE ${where}`,
      values,
    );
    const matched = matchedResult.rows[0].count as number;

    const pageValues = [...values, params.limit, params.offset];
    const rowsResult = await query(
      `SELECT
         p.id,
         p.company_id,
         c.name   AS company,
         c.source AS source,
         p.role,
         p.department,
         to_char(p.first_seen_on, 'YYYY-MM-DD') AS first_seen_on,
         p.repost_count,
         ARRAY(
           SELECT to_char(d, 'YYYY-MM-DD')
           FROM unnest(p.repost_dates) AS d
         ) AS repost_dates,
         p.is_open,
         p.salary_text
       FROM postings p
       JOIN companies c ON c.id = p.company_id
       WHERE ${where}
       ORDER BY ${SORT_CLAUSES[params.sort]}
       LIMIT $${pageValues.length - 1} OFFSET $${pageValues.length}`,
      pageValues,
    );

    const response: PostingsResponse = {
      rows: rowsResult.rows.map(toPostingRow),
      matched,
      total,
    };
    console.log(`Postings served: ${response.rows.length} rows (matched ${matched}, total ${total})`);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export { router as postingsRouter };
