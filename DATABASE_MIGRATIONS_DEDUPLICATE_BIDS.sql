-- Migration: Deduplicate bids table
-- Path: DATABASE_MIGRATIONS_DEDUPLICATE_BIDS.sql
-- Purpose: Remove duplicate rows in `bids` so the unique index can be applied safely.
-- IMPORTANT: Review results and back up your DB before running.

BEGIN;

-- Safety check: list duplicates and their counts (inspect before deleting)
-- Run this first to review duplicates:
-- SELECT auction_id, LOWER(bidder_address) AS bidder, COUNT(*) AS cnt
-- FROM bids
-- GROUP BY auction_id, LOWER(bidder_address)
-- HAVING COUNT(*) > 1
-- ORDER BY cnt DESC;

-- Deduplicate: keep the newest row per (auction_id, LOWER(bidder_address)) by created_at (and id as tie-breaker)
WITH ranked AS (
  SELECT id,
         auction_id,
         LOWER(bidder_address) AS bidder,
         ROW_NUMBER() OVER (PARTITION BY auction_id, LOWER(bidder_address) ORDER BY created_at DESC, id DESC) rn
  FROM bids
)
DELETE FROM bids
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

COMMIT;

-- Rollback example (if needed): restore from backup or use your DB provider's point-in-time restore.

-- Notes:
-- 1) This script permanently deletes rows. Back up the table before running.
-- 2) If you prefer to mark duplicates instead of deleting, you can copy duplicates to a staging table first:
--    CREATE TABLE bids_duplicates AS SELECT * FROM bids WHERE (auction_id, LOWER(bidder_address)) IN (
--      SELECT auction_id, LOWER(bidder_address) FROM bids GROUP BY auction_id, LOWER(bidder_address) HAVING COUNT(*) > 1
--    );
-- 3) After running this dedupe, apply `DATABASE_MIGRATIONS_ADD_BID_UNIQUE.sql` to create the unique index.
