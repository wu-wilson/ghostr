# CLAUDE.md — Ghostr

## What This Is

Ghostr is a job-posting auditor with a dark, editorial visual language. It polls public ATS feeds (Greenhouse / Lever / Ashby) once a day, records every listing it sees, and derives a public board that surfaces each posting's *true* first-seen age, its relist history, and whether salary was disclosed. The single page runs through Zustand state (no router): **the board** (live audit of open postings), **an expanded posting** (the board with one row open), and **methodology** (how the numbers are actually computed). The thesis: ghostr never decides whether a job is "real" — it timestamps the evidence and lets the reader conclude.

## Architecture

- **client/** — React 18 + Vite + TypeScript (strict). Tailwind CSS v3. Zustand for state. No router — board ↔ methodology is store state. All record sentences, tag pills, and timeline geometry are derived client-side from the rows the API returns. No UI component libraries.
- **server/** — Express + TypeScript (strict). pg + pg-pool for Postgres. Zod validation at every boundary. Thin route files (`/api/postings`, `/api/stats`, `/api/meta`, `/api/companies/:id/facts`) over the `postings` view joined to `companies`. Parameterized queries only; per-IP rate limiting on reads; CORS allowlist via env.
- **cron/** — TypeScript Node worker. One adapter per ATS, a per-run orchestrator, repost linking, and normalization. Runs as a one-shot `npm run poll`, writes a `poll_runs` row, and `process.exit(0/1)`. No HTTP surface. Deployed as a Railway daily cron.

## Key Decisions

- **Observation-pure true age.** `first_seen_on` is strictly the date ghostr first *observed* a listing — never backfilled from an ATS posting/created date. Until polling history accrues, the board is young and sparse (most rows read near `0d`); this is intentional and the methodology copy states it honestly.
- **Repost-chain heuristic.** When a new `external_id` first appears, it joins an existing job iff there's a prior listing for the **same company** with the same normalized `match_key` (`title|location|department`) that is still open *or* closed within `REPOST_WINDOW_DAYS` (30). Otherwise a fresh job is created. A job's age always traces to `MIN(first_seen_on)` and is never reset by a relist.
- **Jobs vs listings.** A `job` is the logical role (stable id across relists); a `listing` is one individual posting seen on a feed. The cron's write model is `listings`; `jobs` is a surrogate-identity table so a job id resolves *before* its listing is inserted.
- **Lean 4-table schema + `postings` view.** `companies`, `jobs`, `listings`, `poll_runs` — plus a `postings` VIEW that aggregates listings per job. No duplicated aggregate state. The board and stats read the view.
- **`is_open` is derived**, not stored: a listing is open ⇔ `closed_on IS NULL` (the cron always sets `closed_on`/`last_seen_on` together). The view computes `is_open`; a partial index serves open-only reads.
- **UTC everywhere.** The cron's "today" and the DB's `current_date` (age math + close-out) must agree — both pinned to UTC.
- **Railway daily cron.** The cron is a Railway service purely because `deploy.cronSchedule` is set; it boots, runs one poll, and exits. `restartPolicyType: "NEVER"`.

## Do NOT

- Backfill `first_seen_on` from ATS posting/created dates — true age is observation-only. The adapters deliberately don't even read those fields.
- Write test files or install testing libraries (TypeScript `strict` is the only linter).
- Use `any`, `as` casts (unless unavoidable), or default exports (exception: lazy-loaded route components).
- Use UI component libraries (MUI, Chakra, Radix, shadcn). Build from scratch with Tailwind.
- Hardcode hex colors in component files — use Tailwind semantic tokens mapped from CSS custom properties. No `dark:` prefixes, no theme toggle (dark-mode only).
- Allow horizontal overflow on any screen, or use `h-screen` / `min-h-screen` — use `min-h-dvh`.
- Show blank screens — every state (loading, empty, error, "first poll pending") must have designed UI.
- String-concatenate input into SQL — use parameterized queries (`$1`, `$2`).
- Let one feed failure abort a poll run — isolate failures per company, count them, and continue.
- Leak raw upstream/pg errors to the client — gate client-visible messages behind an `isPublic` flag.

## Rules (path-scoped — loaded automatically when editing matching files)

- `.claude/rules/code-style.md` — TypeScript, JSDoc, import ordering, naming, error handling. Loads for `client/**/*.{ts,tsx}`, `server/**/*.ts`, and `cron/**/*.ts`.
- `.claude/rules/component-patterns.md` — React file structure, state management, derived values. Loads for `client/src/**/*.{ts,tsx}`.
- `.claude/rules/styling.md` — Theming, visual language, interactive states, animation. Loads for `client/src/**/*.{tsx,css}` and `client/tailwind.config.js`.
- `.claude/rules/responsive.md` — Mobile-first breakpoints, viewport units, safe-area handling. Loads for `client/src/**/*.{tsx,css}`.
- `.claude/rules/server-patterns.md` — Route handlers, Zod validation, service layer, security hardening. Loads for `server/src/**/*.ts`.

## Skills (reference knowledge)

- `.claude/skills/design-tokens/` — Exact color hex values, fonts, the scanline/gradient backdrop, animation durations.
- `.claude/skills/audit-model/` — Listing vs job, observation-pure true age, repost detection, how each board number is derived, the `postings` view.
- `.claude/skills/ats-feeds/` — Greenhouse / Lever / Ashby public endpoints, fields, quirks, salary extraction (Workday intentionally not implemented).
