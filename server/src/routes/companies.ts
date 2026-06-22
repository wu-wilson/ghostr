/** Company route: GET /api/companies/:id/facts — per-company aggregates for the expanded detail panel. */
import { Router } from 'express';

import { query } from '../services/db';

const router = Router();

/** Response body for `GET /api/companies/:id/facts`. */
interface CompanyFactsResponse {
  /** Count of this company's postings (jobs) in the view. */
  rolesTracked: number;
  /** Of those, the count currently open. */
  currentlyOpen: number;
  /** Fraction (0..1) of this company's postings reposted at least once. */
  repostRate: number;
}

router.get('/companies/:id/facts', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      console.error(`Invalid company id: ${req.params.id}`);
      res.status(400).json({ error: 'Invalid company id' });
      return;
    }

    const result = await query(
      `SELECT
         COUNT(*)::int                                            AS roles_tracked,
         COUNT(*) FILTER (WHERE is_open)::int                     AS currently_open,
         COALESCE(AVG(CASE WHEN repost_count > 0 THEN 1 ELSE 0 END), 0)::float AS repost_rate
       FROM postings
       WHERE company_id = $1`,
      [id],
    );

    const row = result.rows[0];
    const response: CompanyFactsResponse = {
      rolesTracked: Number(row.roles_tracked),
      currentlyOpen: Number(row.currently_open),
      repostRate: Number(row.repost_rate),
    };
    console.log(`Company facts served: company ${id} (${response.rolesTracked} roles)`);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export { router as companiesRouter };
