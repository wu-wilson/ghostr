---
name: ats-feeds
description: Greenhouse / Lever / Ashby public endpoints, response fields, quirks, and salary extraction. Workday is intentionally not implemented.
user-invocable: true
---

# ATS Feeds

How the poller fetches and normalizes each provider's **public** job board. One adapter per source under `poller/src/adapters/`. Every adapter returns the same normalized shape and **parses the raw payload with Zod first** (these APIs vary by tenant and drift over time — fetch one live response and derive the Zod schema from the actual payload before writing an adapter).

```ts
// Normalized adapter output (per listing)
{ externalId: string; title: string; department: string | null; location: string | null; salaryText: string | null }
```

Ghostr deliberately does **not** read any ATS-provided posting/created date — true age is observation-only (see `audit-model`).

## Greenhouse

- **Endpoint:** `GET https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true`
- **Response:** `{ jobs: [...], meta }`. Per job: `id` (integer → `externalId`, stringify it), `title`, `location.name` (→ location), and an inline `departments[]` array (`departments[0].name` → department; may be empty). `content=true` returns description HTML — we don't store it.
- **Quirks:** `id` is a number, not a string. `departments` is present inline on this endpoint (the separate `/v1/boards/{token}/departments` endpoint exists as a fallback mapping but isn't needed when `departments[]` is populated). Salary is rarely present → `salaryText = null` for most.
- Seeded tokens: `stripe`, `databricks`, `coinbase`, `gusto`, `airtable`, `brex`.

## Lever

- **Endpoint:** `GET https://api.lever.co/v0/postings/{site}?mode=json`
- **Response:** a top-level **array**. Per posting: `id` (UUID string → `externalId`), `text` (→ title), `categories.department` (→ department; `categories.team` is a finer secondary), `categories.location` (→ location), and sometimes `salaryRange` (`{ min, max, currency, interval }` → build a display string when present, else null).
- **Quirks:** a board can resolve `200` yet return an **empty array** (no open postings) — treat that as zero listings, not an error. `salaryRange` is usually `null`. Department lives under `categories`, not at the top level.
- Seeded sites: `spotify`, `palantir`, `matchgroup`.

## Ashby

- **Endpoint:** `GET https://api.ashbyhq.com/posting-api/job-board/{org}?includeCompensation=true`
- **Response:** `{ jobs: [...], apiVersion }`. Per job: `id` (UUID string → `externalId`), `title`, `department`, `team`, `location`, and `compensation` when present. Extract a display string from `compensation.compensationTierSummary` (e.g. `"$211.4K – $290.6K • Offers Equity"`) or fall back to `compensation.scrapeableCompensationSalarySummary`; null when absent.
- **Quirks:** `includeCompensation=true` is required to get the `compensation` block; even then many jobs omit it. `shouldDisplayCompensationOnJobPostings` / `isListed` flags exist — only `isListed` jobs are public-facing.
- Seeded orgs: `notion`, `ramp`, `linear`, `openai`, `deel`.

## Workday — NOT implemented

The data model's `ats_source` enum is `('greenhouse', 'lever', 'ashby')` — Workday is intentionally dropped. Its `POST https://{tenant}.{host}/wday/cxs/{tenant}/{site}/jobs` feed is paginated, tenant-specific, and frequently IP-blocks datacenter runners, so it isn't worth shipping. If ever added: extend the enum, add a `workday.ts` adapter, and store `board_token` as `"tenant:host:site"`.

## Politeness / ethics

- Identify with a descriptive `User-Agent` (`config.userAgent`, default `ghostr-poller (+https://github.com/wu-wilson/ghostr)`).
- Per-request timeout (`REQUEST_TIMEOUT_MS`, default 10000ms) via AbortController; a couple of retries with backoff.
- `p-limit` for small per-host concurrency (`POLL_CONCURRENCY`, default 4) plus a per-host delay.
- Hit only these **public** endpoints — nothing behind a login. Store listing metadata only; never applicant data.
- Isolate failures per company — a 404/timeout/parse error counts toward `poll_runs.errors` and the run continues.
