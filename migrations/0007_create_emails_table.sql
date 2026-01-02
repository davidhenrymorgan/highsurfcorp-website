-- Migration: 0007_create_emails_table
-- Description: Create table for storing inbound/outbound emails via Resend
-- Created: 2026-01-02

CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  message_id TEXT UNIQUE NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  html_body TEXT,
  text_body TEXT,
  thread_id TEXT,
  in_reply_to TEXT,
  direction TEXT DEFAULT 'inbound',
  status TEXT DEFAULT 'unread',
  lead_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_emails_thread ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_from ON emails(from_email);
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails(status);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at);
