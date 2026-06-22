/**
 * A single ATS listing normalized to the shape the cron persists. Every adapter
 * produces these regardless of provider; null marks a field the feed did not supply.
 */
export interface NormalizedListing {
  /** Provider-stable ID, unique within a company's board (stringified). */
  externalId: string;
  /** Role title as shown on the board. */
  title: string;
  /** Department/team, or null when absent. */
  department: string | null;
  /** Location string, or null when absent. */
  location: string | null;
  /** Display salary string, or null when not disclosed. */
  salaryText: string | null;
}

/**
 * Fetches and normalizes one company's public ATS feed.
 * @param boardToken - The company's `board_token` (greenhouse token / lever site / ashby org)
 * @returns The company's current open listings, normalized
 */
export type Adapter = (boardToken: string) => Promise<NormalizedListing[]>;
