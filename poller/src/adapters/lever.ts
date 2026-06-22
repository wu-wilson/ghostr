import { z } from 'zod';

import { fetchJson } from './fetchJson';
import type { Adapter, NormalizedListing } from './types';

/** Defensive schema for a single Lever posting (`mode=json`). */
const leverPostingSchema = z.object({
  id: z.string(),
  text: z.string(),
  categories: z
    .object({
      department: z.string().nullish(),
      team: z.string().nullish(),
      location: z.string().nullish(),
    })
    .nullish(),
  salaryRange: z
    .object({
      min: z.number().nullish(),
      max: z.number().nullish(),
      currency: z.string().nullish(),
    })
    .nullish(),
});

/** Lever returns a top-level array of postings. */
const leverSchema = z.array(leverPostingSchema);

/** Build a "$min–$max" display string from a Lever salary range, or null when unusable. */
function formatSalary(range: z.infer<typeof leverPostingSchema>['salaryRange']): string | null {
  if (!range || range.min == null || range.max == null) {
    return null;
  }
  const prefix = range.currency ? `${range.currency} ` : '$';
  return `${prefix}${range.min.toLocaleString('en-US')}–${range.max.toLocaleString('en-US')}`;
}

/**
 * Fetch and normalize a Lever site.
 * @param boardToken - The Lever site slug
 * @returns Normalized listings for the site
 */
export const leverAdapter: Adapter = async (boardToken: string): Promise<NormalizedListing[]> => {
  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(boardToken)}?mode=json`;
  const raw = await fetchJson(url);
  const parsed = leverSchema.parse(raw);

  return parsed.map((posting) => ({
    externalId: posting.id,
    title: posting.text,
    department: posting.categories?.department ?? posting.categories?.team ?? null,
    location: posting.categories?.location ?? null,
    salaryText: formatSalary(posting.salaryRange),
  }));
};
