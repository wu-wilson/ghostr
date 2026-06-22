---
paths:
  - "server/src/**/*.ts"
---

# Server Patterns

## Routes

- One route handler per file under `server/src/routes/` (`postings.ts`, `stats.ts`, `meta.ts`; company facts live with the posting/company reads).
- Validate every input with Zod before business logic — query params on `/api/postings` (`search`, `filter` ∈ `all|old|hidden|reposted`, `sort` ∈ `oldest|reposted|newest`, `limit`, `offset`) and the `:id` on company facts.
- SQL/business logic in `server/src/services/` (`db.ts` owns the pool + query helpers), not in handlers.
- Single tail error-handling middleware in `middleware/errorHandler.ts`.

## API semantics

- `/api/postings` reads the `postings` view joined to `companies`, **open postings only**. Returns `{ rows, matched, total }` — `total` = all open postings, `matched` = those passing search + filter. Filters: `old` = age ≥ 60d, `hidden` = `salary_text IS NULL`, `reposted` = `repost_count >= 3`. Each sort carries a stable `id` tiebreak so `limit`/`offset` paging can't skip or duplicate rows.
- `/api/stats`, `/api/meta`, `/api/companies/:id/facts` are read-only aggregates over the view + `poll_runs`. A null latest `poll_runs.ran_at` → `lastPolledAt: null` (client shows "first poll pending").

## Security

- `app.set('trust proxy', 1)` — Railway is one hop, so `req.ip` resolves to the real client (required for per-IP rate limiting). If fronted by Cloudflare, key off `CF-Connecting-IP`.
- No security-header middleware: this is a JSON API and never serves HTML. Set HSTS at the edge if fronted by Cloudflare.
- Per-IP read rate limit via `express-rate-limit` (in-memory), `config.readRateLimitPerHour` (default 200/hr/IP) across the GET endpoints.
- CORS allowlist via `config.allowedOrigins` (comma-separated env, `*` in dev).
- **Never leak raw upstream/pg error messages.** `errorHandler` only echoes `err.message` when the thrown error carries `isPublic: true`; everything else becomes "Internal server error". Don't include Zod issue paths or pg wording in client responses.

## Database

- Parameterized SQL queries (`$1`, `$2`) — never string-concatenate input.
- `pg-pool` (`max: 10`), release in `finally` blocks.
- Graceful degradation: if Postgres is unreachable, read endpoints return 503.
- All date/age math is **UTC** — `current_date` and the cron's "today" must agree.

## Environment

- Env vars read once at startup into a typed `config` object (`PORT`, `DATABASE_URL`, `ALLOWED_ORIGINS`, `READ_RATE_LIMIT_PER_HOUR`).
- Log request outcome on each request. Never log full payloads, connection strings, or headers.
