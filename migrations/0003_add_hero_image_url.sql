-- Migration: 0003_add_hero_image_url
-- Description: Add pre-computed hero_image_url column to posts table
-- Created: 2026-01-01

-- Add hero_image_url column for canonical display image
-- This eliminates runtime body parsing in list queries
ALTER TABLE posts ADD COLUMN hero_image_url TEXT;

-- Record migration
INSERT INTO schema_migrations (version, name)
VALUES ('0003', 'add_hero_image_url');
