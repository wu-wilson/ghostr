import dotenv from 'dotenv';
dotenv.config();

/** Default User-Agent identifying the cron to public ATS endpoints. */
const DEFAULT_USER_AGENT = 'ghostr (+https://ghostr.dev)';

/** Typed, frozen configuration loaded from environment variables at startup. */
export const config = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/ghostr',
  pollConcurrency: parseInt(process.env.POLL_CONCURRENCY || '4', 10),
  requestTimeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '10000', 10),
  userAgent: process.env.USER_AGENT || DEFAULT_USER_AGENT,
  repostWindowDays: parseInt(process.env.REPOST_WINDOW_DAYS || '30', 10),
} as const;
