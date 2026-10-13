-- Apply only in a dedicated Tondi Neon project. No Pareso tables are involved.
CREATE TABLE IF NOT EXISTS tondi_documents (
  id SMALLINT PRIMARY KEY CHECK (id=1),
  version INTEGER NOT NULL DEFAULT 0,
  draft JSONB NOT NULL,
  published JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS tondi_login_attempts (
  identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tondi_login_attempts_lookup ON tondi_login_attempts(identifier,created_at);
