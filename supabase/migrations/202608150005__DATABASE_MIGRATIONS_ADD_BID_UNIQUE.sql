-- Original: DATABASE_MIGRATIONS_ADD_BID_UNIQUE.sql
-- Migration: Add unique constraint to ensure one bid per bidder per auction

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS unique_auction_bidder
ON bids (auction_id, LOWER(bidder_address));

COMMIT;

-- Notes: Ensure deduplication before applying to production DB
