-- Migration: 0006_competitors_content
-- Description: Add raw_content column to competitors for blog context
-- Created: 2026-01-02

-- Add raw_content column to store markdown for blog generation
ALTER TABLE competitors ADD COLUMN raw_content TEXT;

-- Add structured_data column for Firecrawl JSON extraction
ALTER TABLE competitors ADD COLUMN structured_data TEXT;

-- Track migration
INSERT OR IGNORE INTO schema_migrations (version, name, applied_at)
VALUES ('0006', 'competitors_content', datetime('now'));
