import type { PostingRow } from '../types/posting';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Whole UTC days between a 'YYYY-MM-DD' date and today.
 * @param isoDate - A calendar date in 'YYYY-MM-DD' form
 * @returns The age in whole UTC days (never negative)
 */
export function ageInDays(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  const then = Date.UTC(year, month - 1, day);
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.round((today - then) / MS_PER_DAY));
}

/**
 * Format a day count as a compact age label.
 * @param days - A whole number of days
 * @returns The age suffixed with `d` (e.g. `112d`)
 */
export function formatAge(days: number): string {
  return `${days}d`;
}

/**
 * The most recent relist date, or null when never reposted.
 * @param row - The posting
 * @returns The latest 'YYYY-MM-DD' repost date, or null
 */
export function latestReposted(row: PostingRow): string | null {
  if (row.repostDates.length === 0) return null;
  return row.repostDates.reduce((max, d) => (d > max ? d : max));
}

/**
 * Build the generated "the record" sentence for a posting.
 * @param row - The posting
 * @returns A human sentence describing first-seen age, relist history, and salary disclosure
 */
export function recordSentence(row: PostingRow): string {
  const age = ageInDays(row.firstSeenOn);
  let sentence = `First seen ${age} days ago, and still live today.`;

  if (row.repostCount > 0) {
    const latest = latestReposted(row);
    const latestAge = latest === null ? age : ageInDays(latest);
    sentence += ` Relisted ${row.repostCount}× — most recently ${latestAge}d ago; each relist reset the board's "posted" date to today.`;
  } else {
    sentence += ` Never relisted; still on its original posting.`;
  }

  if (row.salaryText === null) {
    sentence += ` Salary is not disclosed.`;
  } else {
    sentence += ` Salary is disclosed (${row.salaryText}).`;
  }

  return sentence;
}

/**
 * Build the three lowercase tag-pill labels for a posting.
 * @param row - The posting
 * @returns Ordered labels: open age, repost state, salary state
 */
export function tagPills(row: PostingRow): [string, string, string] {
  const age = ageInDays(row.firstSeenOn);
  return [
    `open ${age}d`,
    row.repostCount > 0 ? `reposted ${row.repostCount}×` : 'never reposted',
    row.salaryText === null ? 'salary withheld' : 'salary listed',
  ];
}

/** A single timeline tick positioned along the first-seen → now span. */
export interface TimelineTick {
  /** Horizontal offset, 0 (first seen) to 100 (now), as a percentage. */
  leftPct: number;
}

/** Derived model powering the repost-timeline visualization. */
export interface TimelineModel {
  ticks: TimelineTick[];
  /** Left-endpoint label (e.g. `first seen · 112d ago`). */
  firstLabel: string;
  /** One-line summary beneath the track. */
  summary: string;
  /** Age in days of the most recent relist, or null when never reposted. */
  latestRepostAge: number | null;
}

/**
 * Build the repost-timeline model for a posting.
 * Each relist tick is placed by its real first-seen date across the first-seen → now span,
 * so first-seen sits at 0% and now at 100%.
 * @param row - The posting
 * @returns Tick positions, endpoint label, summary line, and the latest relist age
 */
export function timelineModel(row: PostingRow): TimelineModel {
  const firstAge = ageInDays(row.firstSeenOn);

  const ticks: TimelineTick[] = row.repostDates.map((date) => {
    const repostAge = ageInDays(date);
    const leftPct = firstAge === 0 ? 100 : (1 - repostAge / firstAge) * 100;
    return { leftPct: Math.min(100, Math.max(0, leftPct)) };
  });

  const latest = latestReposted(row);
  const latestRepostAge = latest === null ? null : ageInDays(latest);

  const summary =
    row.repostCount > 0
      ? `${row.repostCount} repost${row.repostCount === 1 ? '' : 's'} · latest ${latestRepostAge}d ago`
      : 'never reposted · still on its original listing';

  return {
    ticks,
    firstLabel: `first seen · ${firstAge}d ago`,
    summary,
    latestRepostAge,
  };
}
