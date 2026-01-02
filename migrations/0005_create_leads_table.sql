-- Migration: 0005_create_leads_table
-- Description: Create table for storing contact form leads
-- Created: 2026-01-02

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  zip TEXT,
  budget TEXT,
  message TEXT,
  status TEXT DEFAULT 'new', -- new, contacted, closed
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
