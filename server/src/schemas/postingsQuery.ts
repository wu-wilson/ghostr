import { z } from 'zod';

/** Default page size for the board (matches the client's "load more" increment). */
const DEFAULT_LIMIT = 6;
/** Hard cap on page size, so a crafted `limit` can't request an unbounded result set. */
const MAX_LIMIT = 50;

/**
 * Validated, coerced query params for `GET /api/postings`.
 * `filter` narrows the open-postings universe (`old` = age ≥ 60d, `hidden` = salary undisclosed,
 * `reposted` = repost_count ≥ 3); `sort` orders the matched rows; `limit`/`offset` paginate.
 * All fields fall back to safe defaults when absent or malformed.
 */
export const PostingsQuerySchema = z.object({
  search: z.string().trim().max(200).optional().default(''),
  filter: z.enum(['all', 'old', 'hidden', 'reposted']).optional().default('all'),
  sort: z.enum(['oldest', 'reposted', 'newest']).optional().default('oldest'),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

/** Inferred TypeScript type for validated postings query params. */
export type PostingsQuery = z.infer<typeof PostingsQuerySchema>;
