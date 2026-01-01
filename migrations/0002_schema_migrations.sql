-- Migration: 0002_schema_migrations
-- Description: Add schema_migrations table to track applied migrations
-- Created: 2026-01-01

-- Schema migrations tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT DEFAULT (datetime('now'))
);

-- Mark existing migrations as applied (if tables exist)
INSERT OR IGNORE INTO schema_migrations (version, name) VALUES ('0001', 'initial_schema');
INSERT OR IGNORE INTO schema_migrations (version, name) VALUES ('0002', 'schema_migrations');
