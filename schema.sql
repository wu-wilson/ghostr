-- Ghostr — canonical Postgres schema + companies seed.
-- Run once locally (psql ghostr -f schema.sql) and once against Railway Postgres.
-- Four tables + one read view. The board and stats are DERIVED from raw daily
-- observations stored in `listings`, so there is no aggregate state to keep in sync.

CREATE TYPE ats_source AS ENUM ('greenhouse', 'lever', 'ashby');

-- Companies we poll. Soft-deactivated via is_active (not hard-deleted in normal operation).
CREATE TABLE companies (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text NOT NULL,
  source      ats_source NOT NULL,
  board_token text NOT NULL,                 -- greenhouse token / lever site / ashby org
  is_active   boolean NOT NULL DEFAULT true, -- false = stop polling (board gone / opted out)
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT companies_source_token_key UNIQUE (source, board_token)
);

-- A job = the logical role the board shows as one "posting". One per company; stable id across relists.
-- Surrogate PK so the poller knows a job's id *before* inserting its listings (avoids a
-- self-referential pointer, which can't be set at insert and would drop heads from the view).
CREATE TABLE jobs (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id  integer NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX jobs_company_idx ON jobs (company_id);

-- One row per individual listing ever seen on a feed (a job's original posting + each repost).
-- The poller's write model.
CREATE TABLE listings (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_id     integer NOT NULL REFERENCES companies(id) ON DELETE CASCADE,  -- kept for the natural key + per-company polling indexes (external_id is only unique within a company)
  job_id         integer NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  external_id    text NOT NULL,              -- stable ID from the ATS, unique within a company's board
  title          text NOT NULL,
  department     text,
  location       text,
  match_key      text NOT NULL,              -- normalized title|location|department, for repost linking
  salary_text    text,                       -- NULL = not disclosed
  first_seen_on  date NOT NULL,              -- never moved after insert; true age anchor
  last_seen_on   date NOT NULL,              -- bumped every poll the listing is present
  closed_on      date,                       -- first day absent after being open; NULL = currently open
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT listings_company_external_key UNIQUE (company_id, external_id),
  CONSTRAINT listings_dates_chk CHECK (
    last_seen_on >= first_seen_on AND (closed_on IS NULL OR closed_on >= first_seen_on))
);
CREATE INDEX listings_job_idx       ON listings (job_id);
CREATE INDEX listings_matchkey_idx  ON listings (company_id, match_key);  -- also serves company_id-prefix lookups + FK cascade
CREATE INDEX listings_open_idx      ON listings (company_id) WHERE closed_on IS NULL;

-- One row per completed poll run. Powers the "last poll" stamp + ops visibility.
CREATE TABLE poll_runs (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ran_at            timestamptz NOT NULL DEFAULT now(),
  companies_polled  integer NOT NULL,
  listings_seen     integer NOT NULL,
  errors            integer NOT NULL DEFAULT 0
);

-- Read model: a "posting" = a job, aggregated from its listings.
-- is_open is DERIVED (a listing is open ⇔ closed_on IS NULL). repost_dates feeds the
-- timeline; repost_count stays for SQL sort/filter; last_reposted_on = max(repost_dates) client-side.
CREATE VIEW postings AS
SELECT
  l.job_id                                                    AS id,
  l.company_id,
  MIN(l.first_seen_on)                                        AS first_seen_on,
  COUNT(*) - 1                                                AS repost_count,
  (array_agg(l.first_seen_on ORDER BY l.first_seen_on))[2:]   AS repost_dates,
  bool_or(l.closed_on IS NULL)                                AS is_open,
  (array_agg(l.title       ORDER BY l.first_seen_on DESC))[1] AS role,
  (array_agg(l.department  ORDER BY l.first_seen_on DESC))[1] AS department,
  (array_agg(l.salary_text ORDER BY l.first_seen_on DESC))[1] AS salary_text
FROM listings l
GROUP BY l.job_id, l.company_id;

-- Companies seed (NOT listings/jobs — those come from polling).
-- Every board_token below was verified to resolve (HTTP 200) against its live ATS endpoint at build time.
INSERT INTO companies (name, source, board_token) VALUES
  ('Databricks',  'greenhouse', 'databricks'),
  ('Stripe',      'greenhouse', 'stripe'),
  ('MongoDB',     'greenhouse', 'mongodb'),
  ('Datadog',     'greenhouse', 'datadog'),
  ('Anthropic',   'greenhouse', 'anthropic'),
  ('Samsara',     'greenhouse', 'samsara'),
  ('Brex',        'greenhouse', 'brex'),
  ('Roblox',      'greenhouse', 'roblox'),
  ('Airbnb',      'greenhouse', 'airbnb'),
  ('Block',       'greenhouse', 'block'),
  ('Cloudflare',  'greenhouse', 'cloudflare'),
  ('Pinterest',   'greenhouse', 'pinterest'),
  ('Reddit',      'greenhouse', 'reddit'),
  ('Twilio',      'greenhouse', 'twilio'),
  ('Figma',       'greenhouse', 'figma'),
  ('Instacart',   'greenhouse', 'instacart'),
  ('Affirm',      'greenhouse', 'affirm'),
  ('Robinhood',   'greenhouse', 'robinhood'),
  ('GitLab',      'greenhouse', 'gitlab'),
  ('Asana',       'greenhouse', 'asana'),
  ('Lyft',        'greenhouse', 'lyft'),
  ('Postman',     'greenhouse', 'postman'),
  ('Fivetran',    'greenhouse', 'fivetran'),
  ('Coinbase',    'greenhouse', 'coinbase'),
  ('Flexport',    'greenhouse', 'flexport'),
  ('Gusto',       'greenhouse', 'gusto'),
  ('Faire',       'greenhouse', 'faire'),
  ('Discord',     'greenhouse', 'discord'),
  ('Dropbox',     'greenhouse', 'dropbox'),
  ('Checkr',      'greenhouse', 'checkr'),
  ('Mercury',     'greenhouse', 'mercury'),
  ('Airtable',    'greenhouse', 'airtable'),
  ('Webflow',     'greenhouse', 'webflow'),
  ('Calendly',    'greenhouse', 'calendly'),
  ('Palantir',    'lever',      'palantir'),
  ('Spotify',     'lever',      'spotify'),
  ('Match Group', 'lever',      'matchgroup'),
  ('OpenAI',      'ashby',      'openai'),
  ('Snowflake',   'ashby',      'snowflake'),
  ('Notion',      'ashby',      'notion'),
  ('Ramp',        'ashby',      'ramp'),
  ('Plaid',       'ashby',      'plaid'),
  ('Vanta',       'ashby',      'vanta'),
  ('Benchling',   'ashby',      'benchling'),
  ('Linear',      'ashby',      'linear'),
  ('Deel',        'ashby',      'deel');
