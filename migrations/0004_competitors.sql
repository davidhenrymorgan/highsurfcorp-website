-- Migration: competitors
-- Description: Add competitors table for intelligence data
-- Created: 2026-01-02

CREATE TABLE IF NOT EXISTS competitors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  insights TEXT,
  pages_crawled INTEGER DEFAULT 0,
  crawled_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Track migration
INSERT OR IGNORE INTO schema_migrations (version, name, applied_at)
VALUES ('0004', 'competitors', datetime('now'));
