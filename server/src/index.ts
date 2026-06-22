import dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import { config } from './config';
import { createCorsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { readLimiter } from './middleware/rateLimiter';
import { companiesRouter } from './routes/companies';
import { metaRouter } from './routes/meta';
import { postingsRouter } from './routes/postings';
import { statsRouter } from './routes/stats';
import { initDb } from './services/db';

const app = express();

// Resolves req.ip to the client behind Railway's proxy.
app.set('trust proxy', 1);

// Middleware
app.use(createCorsMiddleware());
app.use(express.json({ limit: '100kb' }));

// Health check (Railway healthcheckPath).
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'ghostr-api' });
});

// Routes (read-only — per-IP rate limited).
app.use('/api', readLimiter);
app.use('/api', postingsRouter);
app.use('/api', statsRouter);
app.use('/api', metaRouter);
app.use('/api', companiesRouter);

// Error handler (tail)
app.use(errorHandler);

// Start (after the DB connection probe)
initDb().then(() => {
  app.listen(config.port, () => {
    console.log(`Ghostr API running on port ${config.port}`);
  });
});
