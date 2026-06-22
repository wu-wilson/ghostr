/** Stats route: GET /api/stats — the live figures behind the board's stat strip. */
import { Router } from 'express';

import { query } from '../services/db';

const router = Router();

/** Response body for `GET /api/stats`. */
interface StatsResponse {
  /** Count of active (still-polled) companies. */
  companiesPolled: number;
  /** Count of all postings (jobs) tracked, open or closed. */
  postingsTracked: number;
  /** Median age in days of open postings (`current_date - first_seen_on`), rounded. */
  medianAgeDays: number;
  /** Fraction (0..1) of postings reposted at least once. */
  repostRate: number;
}

router.get('/stats', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT
         (SELECT COUNT(*)::int FROM companies WHERE is_active) AS companies_polled,
         (SELECT COUNT(*)::int FROM postings)                  AS postings_tracked,
         COALESCE(
           ROUND(
             PERCENTILE_CONT(0.5) WITHIN GROUP (
               ORDER BY current_date - first_seen_on
             ) FILTER (WHERE is_open)
           ),
           0
         )::int AS median_age_days,
         COALESCE(
           AVG(CASE WHEN repost_count > 0 THEN 1 ELSE 0 END),
           0
         )::float AS repost_rate
       FROM postings`,
    );

    const row = result.rows[0];
    const response: StatsResponse = {
      companiesPolled: Number(row.companies_polled),
      postingsTracked: Number(row.postings_tracked),
      medianAgeDays: Number(row.median_age_days),
      repostRate: Number(row.repost_rate),
    };
    console.log(`Stats served: ${response.postingsTracked} postings, ${response.companiesPolled} companies`);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export { router as statsRouter };
