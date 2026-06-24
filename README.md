## ⚡ Overview

[**Ghostr**](https://ghostr.dev) is a job-posting auditor. It polls public ATS feeds daily, tracking each listing's true first-seen age and every quiet relist, so stale "ghost jobs" can't pass themselves off as freshly posted.

## 🔭 Architecture

```
┌─────────────────────────────────────────┐
│                 Browser                 │
│                                         │
│       ┌───────────┐  ┌─────────┐        │
│       │ React UI  │←→│ Zustand │        │
│       │(Tailwind) │  │  Store  │        │
│       └─────┬─────┘  └─────────┘        │
└─────────────┼───────────────────────────┘
              │ HTTPS
┌─────────────┴───────────────┐    ┌────────────────┐
│  Express API                │    │      Cron      │
│  /api/postings  /api/stats  │    │    (daily)     │
│  /api/meta                  │    │  Greenhouse /  │
│  /api/companies/:id/facts   │    │ Lever / Ashby  │
└─────────────┬───────────────┘    └───────┬────────┘
              │                            │
      ┌───────┴────────────────────────────┴────┐
      │                Postgres                 │
      │  (companies · jobs · listings · runs)   │
      └─────────────────────────────────────────┘
```

## 🚀 Stack

#### Client

- React 18 (TS)
- Tailwind CSS v3
- Zustand
- Vite 5

#### Server

- Express (TS)
- pg + Zod
- express-rate-limit

#### Cron

- Node.js worker (TS)
- Native `fetch` + Zod
- Inline concurrency limiter
- pg driver

## 🛠️ Local Setup

#### 1. Clone the repository

```bash
git clone https://github.com/wu-wilson/ghostr.git
cd ghostr
```

#### 2. Set up Postgres (one-time)

```bash
brew install postgresql@18
brew services start postgresql@18
createdb ghostr
psql ghostr -f schema.sql
```

#### 3. Launch the app

```bash
./launch.sh
```

The script installs dependencies on first run, then starts the API server on port `3001` and the client on `http://localhost:5173`.

> Requires Node.js 18+ and npm 9+.

The cron is not started by `launch.sh` — it's a scheduled job that runs daily on Railway. To run a one-off poll locally: `cd cron && npm run poll`.

## ☁️ Deployment

Deployed on [Railway](https://railway.app) as three services: the client ships as a static build (`ghostr.dev`), the server runs as a separate API (`api.ghostr.dev`), and the cron runs daily to poll the ATS feeds. DNS via [Cloudflare](https://www.cloudflare.com).

## ⚙️ Configuration

Every variable ships with a working default — `./launch.sh` runs on a fresh clone with no env files; override only to change a default.

- **Local dev** — create `client/.env`, `server/.env`, or `cron/.env` (all gitignored).
- **Production (Railway)** — variables are set in each service's **Variables** tab.

#### Client (`client/`)

| Variable       | Default                 | Description                                                               |
| -------------- | ----------------------- | ------------------------------------------------------------------------- |
| `VITE_API_URL` | `http://localhost:3001` | API server URL. Baked in at **build time** — changing requires a rebuild. |

#### Server (`server/`)

| Variable                   | Default                              | Description                                                          |
| -------------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `PORT`                     | `3001`                               | API listen port. Auto-injected by Railway in production.             |
| `DATABASE_URL`             | `postgresql://localhost:5432/ghostr` | Postgres connection. Read endpoints return 503 if unreachable.       |
| `ALLOWED_ORIGINS`          | `*`                                  | Comma-separated CORS allowlist. Set to `https://ghostr.dev` in prod. |
| `READ_RATE_LIMIT_PER_HOUR` | `600`                                | Read requests/hr/IP across the GET endpoints.                        |

#### Cron (`cron/`)

| Variable             | Default                                         | Description                                                                           |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | `postgresql://localhost:5432/ghostr`            | Postgres connection. The poll fails loudly if unreachable.                            |
| `POLL_CONCURRENCY`   | `4`                                             | Max ATS feeds fetched in parallel (polite per-host concurrency).                      |
| `REQUEST_TIMEOUT_MS` | `10000`                                         | Per-request timeout for outbound feed fetches, in milliseconds.                       |
| `USER_AGENT`         | `ghostr (+https://github.com/wu-wilson/ghostr)` | Identifies the cron to ATS endpoints; production sets `ghostr (+https://ghostr.dev)`. |
| `REPOST_WINDOW_DAYS` | `30`                                            | A closed listing can still anchor a relist within this many days.                     |

Schedule is defined in `cron/railway.json` via `cronSchedule` (currently `17 9 * * *` — daily 09:17 UTC).
