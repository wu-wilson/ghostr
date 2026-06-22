import { adapters } from './adapters';
import { config } from './config';
import {
  closeOutCompany,
  loadActiveCompanies,
  upsertListing,
  writePollRun,
  type CompanyRow,
} from './db';
import { buildMatchKey } from './normalize';
import { resolveListingJobId } from './reposts';

/** Small delay before each feed request, to stay polite to the upstream hosts. */
const POLITE_DELAY_MS = 250;

/** Totals recorded for a completed poll run. */
export interface PollTotals {
  /** Companies whose feed was fetched and reconciled successfully. */
  companiesPolled: number;
  /** Total listings across all successful feeds. */
  listingsSeen: number;
  /** Companies whose feed failed (isolated, non-fatal). */
  errors: number;
}

/** Pause for the given number of milliseconds. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run `tasks` with bounded concurrency via a tiny inline limiter (no `p-limit`): up to
 * `limit` workers drain a shared cursor, staggering every request past the first batch
 * by `POLITE_DELAY_MS` to stay polite to upstream hosts.
 * @param tasks - The unit-of-work functions to run
 * @param limit - Maximum number running at once
 * @returns Resolves once every task settles
 */
async function runWithConcurrency(
  tasks: Array<() => Promise<void>>,
  limit: number,
): Promise<void> {
  let cursor = 0;
  const workerCount = Math.max(1, Math.min(limit, tasks.length));
  const worker = async (): Promise<void> => {
    while (cursor < tasks.length) {
      const index = cursor;
      cursor += 1;
      // Stagger every request past the initial batch to avoid bursting a host.
      if (index >= workerCount) {
        await delay(POLITE_DELAY_MS);
      }
      await tasks[index]();
    }
  };
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
}

/**
 * Fetch one company's feed and reconcile it against `listings`: upsert each listing
 * (resolving job ids via repost linking) then close out anything absent today. Any
 * fetch/parse/DB failure propagates so the caller can isolate and count it.
 * @param company - The company to poll
 * @returns The number of listings seen on this company's feed
 */
async function pollCompany(company: CompanyRow): Promise<number> {
  const adapter = adapters[company.source];
  const listings = await adapter(company.boardToken);

  for (const listing of listings) {
    const matchKey = buildMatchKey(listing.title, listing.location, listing.department);
    const jobId = await resolveListingJobId(company.id, listing.externalId, matchKey);
    await upsertListing({
      companyId: company.id,
      jobId,
      externalId: listing.externalId,
      title: listing.title,
      department: listing.department,
      location: listing.location,
      matchKey,
      salaryText: listing.salaryText,
    });
  }

  await closeOutCompany(company.id);
  return listings.length;
}

/**
 * Run one full poll across all active companies and append a `poll_runs` row.
 *
 * Companies run with bounded concurrency and a small per-host delay. Each company is
 * isolated in its own try/catch — a feed 404/timeout/parse failure is counted and skipped,
 * never aborting the run. A failure to load companies or write the run still throws (fatal).
 * @returns The recorded run totals
 */
export async function runPoll(): Promise<PollTotals> {
  const companies = await loadActiveCompanies();

  const totals: PollTotals = { companiesPolled: 0, listingsSeen: 0, errors: 0 };

  const tasks = companies.map((company) => async (): Promise<void> => {
    try {
      const seen = await pollCompany(company);
      totals.companiesPolled += 1;
      totals.listingsSeen += seen;
    } catch (err) {
      totals.errors += 1;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Feed failed for ${company.name} (${company.source}): ${message}`);
    }
  });

  await runWithConcurrency(tasks, config.pollConcurrency);

  await writePollRun(totals.companiesPolled, totals.listingsSeen, totals.errors);
  return totals;
}
