-- Add category column to events table
-- Run this migration in Supabase SQL editor or via psql

ALTER TABLE IF EXISTS events
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';

-- Optional: If you want to track custom categories separately, consider adding a `custom_category` column instead:
-- ALTER TABLE IF EXISTS events
--   ADD COLUMN IF NOT EXISTS custom_category TEXT;

-- Index for fast filtering by category
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

-- Notes:
-- - This migration adds a nullable text `category` column with empty string default.
-- - After running, new events will be able to set `category` (including custom values).
-- - If you'd rather normalize categories into a separate table, we can add that migration instead.
