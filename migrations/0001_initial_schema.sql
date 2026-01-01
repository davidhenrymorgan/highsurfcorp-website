-- Migration: 0001_initial_schema
-- Description: Initial schema for High Surf Corp CMS
-- Created: 2026-01-01

-- Topics/Categories table
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TEXT,
  updated_at TEXT,
  published_at TEXT
);

-- Blog Posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_tag TEXT,
  hero_image TEXT,
  thumbnail_image TEXT,
  featured INTEGER DEFAULT 0,
  short_preview TEXT,
  title_variation TEXT,
  meta_description TEXT,
  category TEXT,
  body TEXT,
  seo_description TEXT,
  introduction TEXT,
  description_variation TEXT,
  archived INTEGER DEFAULT 0,
  draft INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT,
  published_at TEXT
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
