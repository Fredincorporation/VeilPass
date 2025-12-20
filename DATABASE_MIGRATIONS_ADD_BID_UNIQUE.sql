-- Migration: Add unique constraint to ensure one bid per bidder per auction
-- Path: DATABASE_MIGRATIONS_ADD_BID_UNIQUE.sql
-- Purpose: Prevent duplicate bid rows for the same (auction_id, bidder_address).
-- Apply: Run in Supabase SQL editor or via your DB migration tooling.

BEGIN;

-- Create a unique index on auction_id and lowercased bidder_address
-- Using LOWER(bidder_address) helps avoid case-sensitivity issues with wallet addresses.
CREATE UNIQUE INDEX IF NOT EXISTS unique_auction_bidder
ON bids (auction_id, LOWER(bidder_address));

COMMIT;

-- Rollback (if needed):
-- DROP INDEX IF EXISTS unique_auction_bidder;

-- Notes:
-- 1) Before applying this migration to a DB with existing duplicate rows, you must
--    either deduplicate those rows or run a cleanup step to pick the canonical row to keep.
-- 2) After applying, the database will prevent future duplicate inserts. The
--    server-side `validate_and_place_bid` RPC already uses SELECT ... FOR UPDATE
--    and now also supports update/insert (merge) semantics.
