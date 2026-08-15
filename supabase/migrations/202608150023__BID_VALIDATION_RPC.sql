-- Original: BID_VALIDATION_RPC.sql
-- VeilPass Atomic Bid Validation RPC Function (condensed)

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS validate_and_place_bid(
  p_auction_id BIGINT,
  p_bidder_address VARCHAR,
  p_bid_amount NUMERIC,
  p_amount_usd NUMERIC,
  p_encrypted BOOLEAN
) CASCADE;

-- Main function and helpers (full function present in original repo)
-- (kept in migrations for audit and deployment automation)

-- For brevity, see original file in repo root for full function body
