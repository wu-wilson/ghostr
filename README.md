## ⚡ Overview

[**Ghostr**](https://ghostr.dev) is a job-posting auditor: it polls public ATS feeds once a day, tracks every open listing over time, and detects relists — so it can surface each posting's *true* first-seen age and stale "ghost jobs" can't pass themselves off as posted today.

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
│  Express API                │    │     Poller     │
│  /api/postings  /api/stats  │    │  (daily cron)  │
│  /api/meta                  │    │ Greenhouse /   │
│  /api/companies/:id/facts   │    │ Lever / Ashby  │
└──────────────┬──────────────┘    └───────┬────────┘
               │                            │
        ┌──────┴────────────────────────────┴──────┐
        │                Postgres                  │
        │   (companies · jobs · listings · runs)   │
        └───────────────────────────────────────────┘
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

#### Poller

- Node.js worker (TS)
- undici / native fetch + Zod
- p-limit (polite concurrency)
- pg driver

## 🛠️ Local Setup

#### 1. Clone the repository

```bash
git clone https://github.com/wu-wilson/ghostr.git
cd ghostr
```

#### 2. Set up Postgres (one-time)

```bash
createdb ghostr
psql ghostr -f schema.sql
```

#### 3. Launch the app

```bash
./launch.sh
```

The script installs dependencies on first run, then starts the API server on port `3001` and the client on `http://localhost:5173`.

> Requires Node.js 18+ and npm 9+.

The poller is not started by `launch.sh` — it's a scheduled job that runs daily on Railway. To populate the database with a one-off poll: `cd poller && npm run poll`.

## ☁️ Deployment

Deployed on [Railway](https://railway.app) as three services plus a database: the client ships as a static build (`ghostr.dev`), the server runs as a separate API, and the poller runs as a daily cron that reads the ATS feeds and writes to the shared **Postgres** plugin. DNS via [Cloudflare](https://www.cloudflare.com).

## ⚙️ Configuration

Every variable ships with a working default except `DATABASE_URL`, which the server and poller need to reach Postgres. `./launch.sh` runs on a fresh clone with no env files — override the rest only to change a default.

- **Local dev** — create `client/.env`, `server/.env`, or `poller/.env` (all gitignored).
- **Production (Railway)** — variables are set in each service's **Variables** tab; `DATABASE_URL` is a reference variable to the shared Postgres plugin.

#### Client (`client/`)

| Variable       | Default                 | Description                                                               |
| -------------- | ----------------------- | ------------------------------------------------------------------------- |
| `VITE_API_URL` | `http://localhost:3001` | API server URL. Baked in at **build time** — changing requires a rebuild. |

#### Server (`server/`)

| Variable                   | Default                              | Description                                                          |
| -------------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| `PORT`                     | `3001`                               | API listen port. Auto-injected by Railway in production.            |
| `DATABASE_URL`             | `postgresql://localhost:5432/ghostr` | Postgres connection. Read endpoints return 503 if unreachable.      |
| `ALLOWED_ORIGINS`          | `*`                                  | Comma-separated CORS allowlist. Set to `https://ghostr.dev` in prod. |
| `READ_RATE_LIMIT_PER_HOUR` | `600`                                | Read requests/hr/IP across the GET endpoints.                       |

#### Poller (`poller/`)

| Variable             | Default                              | Description                                                              |
| -------------------- | ------------------------------------ | ------------------------------------------------------------------------ |
| `DATABASE_URL`       | `postgresql://localhost:5432/ghostr` | Postgres connection. The poll fails loudly if unreachable.              |
| `POLL_CONCURRENCY`   | `4`                                  | Max ATS feeds fetched in parallel (polite per-host concurrency).        |
| `REQUEST_TIMEOUT_MS` | `10000`                              | Per-request timeout for outbound feed fetches, in milliseconds.         |
| `USER_AGENT`         | `ghostr-poller (+https://github.com/wu-wilson/ghostr)` | Identifies the poller to upstream ATS endpoints.    |
| `REPOST_WINDOW_DAYS` | `30`                                 | A closed listing can still anchor a relist within this many days.       |

The poll schedule lives in `poller/railway.json` via `cronSchedule` (`17 9 * * *` — daily 09:17 UTC).
