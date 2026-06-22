import { z } from 'zod';

import { fetchJson } from './fetchJson';
import type { Adapter, NormalizedListing } from './types';

/** Defensive schema for the Ashby job-board payload (`includeCompensation=true`). */
const ashbySchema = z.object({
  jobs: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      department: z.string().nullish(),
      team: z.string().nullish(),
      location: z.string().nullish(),
      compensation: z
        .object({
          compensationTierSummary: z.string().nullish(),
          scrapeableCompensationSalarySummary: z.string().nullish(),
        })
        .nullish(),
    }),
  ),
});

/** Pull a display salary string from an Ashby compensation object, or null. */
function extractSalary(
  compensation: z.infer<typeof ashbySchema>['jobs'][number]['compensation'],
): string | null {
  if (!compensation) {
    return null;
  }
  return (
    compensation.compensationTierSummary ??
    compensation.scrapeableCompensationSalarySummary ??
    null
  );
}

/**
 * Fetch and normalize an Ashby job board.
 * @param boardToken - The Ashby organization slug
 * @returns Normalized listings for the board
 */
export const ashbyAdapter: Adapter = async (boardToken: string): Promise<NormalizedListing[]> => {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(
    boardToken,
  )}?includeCompensation=true`;
  const raw = await fetchJson(url);
  const parsed = ashbySchema.parse(raw);

  return parsed.jobs.map((job) => ({
    externalId: job.id,
    title: job.title,
    department: job.department ?? job.team ?? null,
    location: job.location ?? null,
    salaryText: extractSalary(job.compensation),
  }));
};
