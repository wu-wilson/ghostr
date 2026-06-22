import { closePool } from './db';
import { runPoll } from './poll';

/**
 * Run one full poll and exit.
 *
 * Boots, polls every active company (per-company feed failures are isolated and counted,
 * never fatal), appends a `poll_runs` row, and exits. Models the tallies cron one-shot
 * pattern: exits 1 only on a fatal DB/connection failure (load companies / write run), 0
 * otherwise. `DATABASE_URL` defaults to the local dev URL so a misconfigured production env
 * surfaces as a connection error rather than a silent no-op.
 * @returns Resolves immediately before `process.exit` is called
 */
async function main(): Promise<void> {
  let exitCode = 0;

  try {
    const totals = await runPoll();
    console.log(
      `Poll complete: ${totals.companiesPolled} polled, ` +
        `${totals.listingsSeen} listings seen, ${totals.errors} error(s)`,
    );
  } catch (err) {
    console.error('Poll failed:', err);
    exitCode = 1;
  } finally {
    await closePool();
  }

  process.exit(exitCode);
}

main();
