---
name: audit-model
description: Listing vs job, observation-pure true age, repost detection + 30-day window, how each board number is derived, and the postings view.
user-invocable: true
---

# Audit Model

How Ghostr turns raw daily observations into the public board. Source of truth: `schema.sql` (the `postings` view), `poller/src/reposts.ts` + `poller/src/normalize.ts` (linking), and the server's read routes. The product **never decides whether a job is "real"** and **never estimates time-to-fill** — it timestamps evidence and lets the reader conclude.

## Listing vs job

- A **listing** is one individual posting ever seen on a feed — a job's original posting *and* each repost. One row per `(company_id, external_id)`. This is the poller's write model and the only place true-age and repost history can live (you can't derive them from aggregates).
- A **job** is the logical role — a posting plus all of its reposts — owned by exactly one company. It has a surrogate identity PK so the poller can resolve a job's id *before* inserting a listing. A job's age always traces to `MIN(first_seen_on)` across its listings and is never reset by a relist.

## Observation-pure true age

- `first_seen_on` is strictly the date Ghostr **first observed** the listing on a feed — never backfilled from any ATS posting/created date (the adapters don't even read those fields).
- Age = `current_date − first_seen_on`, in days, computed in **UTC** (the poller's "today" and the DB's `current_date` must agree, or ages drift by one).
- Consequence: until polling history accrues, the board is young and sparse — most rows read near `0d`, few reposts. This is intentional; the methodology copy states it honestly. Stats start small (e.g. ~14 companies, a few hundred postings, single-digit-day median early on) — never hardcode dramatic mock numbers.

## Repost detection (linking listings into jobs)

When a **new** `external_id` first appears for a company:

1. Compute its `match_key` via `normalize.ts`: lowercase, trim, collapse whitespace, strip punctuation, coalesce null parts to empty — over `title | location | department`.
2. Find the **most recent** existing listing for the **same `company_id` + `match_key`** that is still open (`closed_on IS NULL`) **or** whose `closed_on >= today − REPOST_WINDOW_DAYS` (default **30**).
3. If found → reuse its `job_id` (this listing is a relist of that role). Otherwise → `INSERT INTO jobs (company_id) … RETURNING id` and use the new id.
4. Insert the listing with the resolved `job_id` — always set, never null.

The match is **same company + normalized title|location|department within 30 days**. Cross-company matches never link.

## How each board number is derived

From the `postings` view (one row per job, `GROUP BY job_id`):

- **first_seen_on** = `MIN(listings.first_seen_on)` — the job's true age anchor.
- **repost_count** = `COUNT(*) - 1` (listings minus the original) — drives SQL sort/filter and the `N×` badge.
- **repost_dates** = `(array_agg(first_seen_on ORDER BY first_seen_on))[2:]` — each relist's real date; feeds the timeline ticks. `last_reposted_on = max(repost_dates)` is derived **client-side**, never stored.
- **is_open** = `bool_or(closed_on IS NULL)` — **derived**, not stored (a listing is open ⇔ `closed_on IS NULL`).
- **role / department / salary_text** = the values from the most recently seen listing (`array_agg(... ORDER BY first_seen_on DESC)[1]`). `salary_text IS NULL` ⇒ "withheld".

Server aggregates over the view:
- `/api/stats` → `companiesPolled` (active companies), `postingsTracked` (all jobs), `medianAgeDays` (`round(PERCENTILE_CONT(0.5))` over **open** postings' ages), `repostRate` (share with `repost_count > 0`).
- `/api/postings` → open postings only; `old` = age ≥ 60d, `hidden` = salary null, `reposted` = `repost_count >= 3`; sorts `oldest|reposted|newest` each with a stable `id` tiebreak.
- `/api/companies/:id/facts` → `rolesTracked`, `currentlyOpen`, `repostRate` over that company's jobs.

## Daily reconciliation (idempotent)

Per company per run: upsert each feed listing by `(company_id, external_id)` — on insert set `first_seen_on = last_seen_on = today` (`closed_on` NULL); on conflict bump `last_seen_on = today`, set `closed_on = NULL` (reopen), refresh mutable fields. **Close-out:** any still-open listing with `last_seen_on < today` → `closed_on = today`. Re-running the same day changes no state beyond `last_seen_on`/`updated_at` (and appends a `poll_runs` row).
