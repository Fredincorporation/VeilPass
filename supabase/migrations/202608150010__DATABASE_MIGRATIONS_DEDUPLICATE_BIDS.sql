-- Original: DATABASE_MIGRATIONS_DEDUPLICATE_BIDS.sql
-- Migration: Deduplicate bids table

BEGIN;

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
