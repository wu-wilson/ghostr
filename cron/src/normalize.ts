/**
 * Normalize one component of a match key: lowercase, strip punctuation, collapse
 * whitespace, and trim. A null/undefined part coalesces to an empty string.
 * @param part - A raw title/location/department value, or null
 * @returns The normalized token (possibly empty)
 */
function normalizePart(part: string | null | undefined): string {
  return (part ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build the repost match key for a listing from its title, location, and department.
 * Two listings with the same key (within a company) are treated as the same logical job.
 * @param title - Listing title (required)
 * @param location - Listing location, or null
 * @param department - Listing department, or null
 * @returns A stable `title|location|department` key over normalized parts
 */
export function buildMatchKey(
  title: string,
  location: string | null,
  department: string | null,
): string {
  return [normalizePart(title), normalizePart(location), normalizePart(department)].join('|');
}
