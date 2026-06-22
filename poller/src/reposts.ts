import { resolveJobId, query } from './db';

/**
 * Determine whether a listing already exists for `(company_id, external_id)`.
 * An existing listing keeps its `job_id`, so repost linking only runs for genuinely
 * new external ids.
 * @param companyId - The owning company id
 * @param externalId - The provider-stable external id
 * @returns The existing `job_id`, or null when this external id has never been seen
 */
async function findExistingJobId(
  companyId: number,
  externalId: string,
): Promise<number | null> {
  const result = await query(
    'SELECT job_id FROM listings WHERE company_id = $1 AND external_id = $2',
    [companyId, externalId],
  );
  return result.rows.length > 0 ? (result.rows[0].job_id as number) : null;
}

/**
 * Resolve the `job_id` to attach to a listing about to be upserted.
 *
 * If the `external_id` already exists, its job id is kept (the upsert only refreshes the
 * existing row). Otherwise the listing is new: link it into the most recent in-window job
 * sharing its `match_key` (a repost), or create a fresh job when none qualifies.
 * @param companyId - The owning company id
 * @param externalId - The provider-stable external id
 * @param matchKey - The normalized match key
 * @returns The job id to persist on the listing (always set, never null)
 */
export async function resolveListingJobId(
  companyId: number,
  externalId: string,
  matchKey: string,
): Promise<number> {
  const existing = await findExistingJobId(companyId, externalId);
  if (existing !== null) {
    return existing;
  }
  return resolveJobId(companyId, matchKey);
}
