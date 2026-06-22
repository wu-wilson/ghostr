import { z } from 'zod';

import { fetchJson } from './fetchJson';
import type { Adapter, NormalizedListing } from './types';

/** Defensive schema for the Greenhouse `jobs?content=true` payload. */
const greenhouseSchema = z.object({
  jobs: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      location: z.object({ name: z.string().nullish() }).nullish(),
      departments: z.array(z.object({ name: z.string().nullish() })).nullish(),
    }),
  ),
});

/**
 * Pick the first meaningful department name from a job's inline `departments[]`, skipping
 * Greenhouse's "No Department" placeholder and empty/whitespace names.
 * @param departments - The job's inline departments array, or null/undefined
 * @returns The first usable department name, or null when none qualifies
 */
function pickDepartment(
  departments: z.infer<typeof greenhouseSchema>['jobs'][number]['departments'],
): string | null {
  if (!departments) {
    return null;
  }
  for (const department of departments) {
    const name = department.name?.trim();
    if (name && name.toLowerCase() !== 'no department') {
      return name;
    }
  }
  return null;
}

/**
 * Fetch and normalize a Greenhouse board.
 * Department is taken from the first meaningful entry in the job's inline `departments[]`
 * (skipping the "No Department" placeholder); salary is rarely present, so it is left null.
 * @param boardToken - The Greenhouse board token
 * @returns Normalized listings for the board
 */
export const greenhouseAdapter: Adapter = async (
  boardToken: string,
): Promise<NormalizedListing[]> => {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(
    boardToken,
  )}/jobs?content=true`;
  const raw = await fetchJson(url);
  const parsed = greenhouseSchema.parse(raw);

  return parsed.jobs.map((job) => ({
    externalId: String(job.id),
    title: job.title,
    department: pickDepartment(job.departments),
    location: job.location?.name ?? null,
    salaryText: null,
  }));
};
