/** Meta route: GET /api/meta — the "last poll" stamp for the top bar. */
import { Router } from 'express';

import { query } from '../services/db';

const router = Router();

/** Response body for `GET /api/meta`. */
interface MetaResponse {
  /** ISO timestamp of the most recent completed poll run, or `null` before the first run. */
  lastPolledAt: string | null;
}

router.get('/meta', async (_req, res, next) => {
  try {
    const result = await query('SELECT MAX(ran_at) AS last_polled_at FROM poll_runs');

    const lastPolledAt = result.rows[0].last_polled_at as Date | null;
    const response: MetaResponse = {
      lastPolledAt: lastPolledAt ? lastPolledAt.toISOString() : null,
    };
    console.log(`Meta served: lastPolledAt ${response.lastPolledAt ?? 'pending'}`);
    res.json(response);
  } catch (err) {
    next(err);
  }
});

export { router as metaRouter };
