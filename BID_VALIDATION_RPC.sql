-- ============================================================================
-- VeilPass Atomic Bid Validation RPC Function
-- ============================================================================
-- Run this in Supabase SQL editor to add atomic bid validation
-- This function prevents race conditions by ensuring only valid higher bids are accepted
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS validate_and_place_bid(
  p_auction_id BIGINT,
  p_bidder_address VARCHAR,
  p_bid_amount NUMERIC,
  p_amount_usd NUMERIC,
  p_encrypted BOOLEAN
) CASCADE;

-- ============================================================================
-- Main Function: Validate and atomically place a bid
-- ============================================================================
-- Returns:
--   - success: true if bid was placed successfully
--   - bid_id: ID of the newly placed bid (if successful)
--   - highest_bid: Current highest bid amount
--   - bid_count: Total bid count for this auction
--   - error: Error message if validation failed
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_and_place_bid(
  p_auction_id BIGINT,
  p_bidder_address VARCHAR,
  p_bid_amount NUMERIC,
  p_amount_usd NUMERIC,
  p_encrypted BOOLEAN
)
RETURNS TABLE (
  success BOOLEAN,
  bid_id BIGINT,
  highest_bid NUMERIC,
  bid_count BIGINT,
  minimum_required NUMERIC,
  error TEXT
) AS $$
DECLARE
  v_current_highest NUMERIC;
  v_bid_count BIGINT;
  v_auction_status VARCHAR;
  v_end_time TIMESTAMP WITH TIME ZONE;
  v_minimum_required NUMERIC;
  v_new_bid_id BIGINT;
  v_start_bid NUMERIC;
  v_listing_price NUMERIC;
BEGIN
  -- Lock the auction row to prevent concurrent modifications
  PERFORM 1 FROM auctions WHERE id = p_auction_id FOR UPDATE;

  -- Fetch auction details
  SELECT 
    status,
    end_time,
    start_bid,
    listing_price,
    COALESCE(MAX(b.amount), 0)
  INTO 
    v_auction_status,
    v_end_time,
    v_start_bid,
    v_listing_price,
    v_current_highest
  FROM auctions a
  LEFT JOIN bids b ON a.id = b.auction_id
  WHERE a.id = p_auction_id
  GROUP BY a.id, a.status, a.end_time, a.start_bid, a.listing_price;

  -- Check if auction exists
  IF v_auction_status IS NULL THEN
    RETURN QUERY SELECT 
      false, 
      NULL::BIGINT, 
      NULL::NUMERIC, 
      0::BIGINT, 
      NULL::NUMERIC,
      'Auction not found'::TEXT;
    RETURN;
  END IF;

  -- Check if auction is still active
  IF v_auction_status != 'active' THEN
    RETURN QUERY SELECT 
      false, 
      NULL::BIGINT, 
      v_current_highest, 
      (SELECT COUNT(*)::BIGINT FROM bids WHERE auction_id = p_auction_id),
      NULL::NUMERIC,
      'Auction is not active'::TEXT;
    RETURN;
  END IF;

  -- Check if auction has ended
  IF v_end_time < NOW() THEN
    RETURN QUERY SELECT 
      false, 
      NULL::BIGINT, 
      v_current_highest, 
      (SELECT COUNT(*)::BIGINT FROM bids WHERE auction_id = p_auction_id),
      NULL::NUMERIC,
      'Auction has ended'::TEXT;
    RETURN;
  END IF;

  -- Get bid count
  SELECT COUNT(*)::BIGINT INTO v_bid_count FROM bids WHERE auction_id = p_auction_id;

  -- Calculate minimum required bid using tiered increment logic
  -- This mirrors the bidConfig.ts logic on the client side
  IF v_current_highest = 0 THEN
    -- First bid: must exceed starting bid
    v_minimum_required := GREATEST(v_start_bid, v_listing_price);
  ELSE
    -- Subsequent bids: must exceed current highest + tier-based increment
    IF v_current_highest < 0.1 THEN
      -- Tier 1: 0.0001 ETH minimum increment
      v_minimum_required := v_current_highest + 0.0001;
    ELSIF v_current_highest < 1 THEN
      -- Tier 2: 0.001 ETH or 1% (whichever is greater)
      v_minimum_required := v_current_highest + GREATEST(0.001, v_current_highest * 0.01);
    ELSIF v_current_highest < 10 THEN
      -- Tier 3: 0.01 ETH or 0.5% (whichever is greater)
      v_minimum_required := v_current_highest + GREATEST(0.01, v_current_highest * 0.005);
    ELSE
      -- Tier 4: 0.1 ETH or 0.25% (whichever is greater)
      v_minimum_required := v_current_highest + GREATEST(0.1, v_current_highest * 0.0025);
    END IF;
  END IF;

  -- Validate the bid amount
  IF p_bid_amount <= v_minimum_required THEN
    RETURN QUERY SELECT 
      false, 
      NULL::BIGINT, 
      v_current_highest, 
      v_bid_count,
      v_minimum_required,
      'Bid amount must be greater than ' || v_minimum_required::TEXT || ' ETH (current minimum with increment)'::TEXT;
    RETURN;
  END IF;

  -- Validate bid amount is a positive number
  IF p_bid_amount <= 0 THEN
    RETURN QUERY SELECT 
      false, 
      NULL::BIGINT, 
      v_current_highest, 
      v_bid_count,
      v_minimum_required,
      'Bid amount must be greater than 0'::TEXT;
    RETURN;
  END IF;

  -- All validations passed - insert the bid atomically
  INSERT INTO bids (
    auction_id,
    bidder_address,
    amount,
    amount_usd,
    encrypted,
    created_at
  ) VALUES (
    p_auction_id,
    p_bidder_address,
    p_bid_amount,
    p_amount_usd,
    p_encrypted,
    NOW()
  )
  RETURNING id INTO v_new_bid_id;

  -- Return success with bid details
  RETURN QUERY SELECT 
    true,
    v_new_bid_id,
    p_bid_amount,
    v_bid_count + 1,
    v_minimum_required,
    NULL::TEXT;

EXCEPTION WHEN OTHERS THEN
  -- Return error details
  RETURN QUERY SELECT 
    false, 
    NULL::BIGINT, 
    v_current_highest, 
    v_bid_count,
    v_minimum_required,
    'Database error: ' || SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Helper Function: Get current highest bid for an auction
-- ============================================================================
CREATE OR REPLACE FUNCTION get_auction_highest_bid(p_auction_id BIGINT)
RETURNS TABLE (
  highest_bid NUMERIC,
  bid_count BIGINT,
  bidder_address VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(MAX(b.amount), 0)::NUMERIC as highest_bid,
    COUNT(b.id)::BIGINT as bid_count,
    (SELECT bidder_address FROM bids WHERE auction_id = p_auction_id ORDER BY amount DESC LIMIT 1)::VARCHAR as bidder_address
  FROM bids b
  WHERE b.auction_id = p_auction_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Helper Function: Validate bid against current auction state (read-only)
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_bid_against_auction(
  p_auction_id BIGINT,
  p_proposed_bid NUMERIC
)
RETURNS TABLE (
  is_valid BOOLEAN,
  current_highest NUMERIC,
  minimum_required NUMERIC,
  status VARCHAR,
  error_message TEXT
) AS $$
DECLARE
  v_current_highest NUMERIC;
  v_auction_status VARCHAR;
  v_end_time TIMESTAMP WITH TIME ZONE;
  v_minimum_required NUMERIC;
  v_start_bid NUMERIC;
  v_listing_price NUMERIC;
BEGIN
  -- Fetch auction details (no lock for read-only validation)
  SELECT 
    status,
    end_time,
    start_bid,
    listing_price,
    COALESCE(MAX(b.amount), 0)
  INTO 
    v_auction_status,
    v_end_time,
    v_start_bid,
    v_listing_price,
    v_current_highest
  FROM auctions a
  LEFT JOIN bids b ON a.id = b.auction_id
  WHERE a.id = p_auction_id
  GROUP BY a.id, a.status, a.end_time, a.start_bid, a.listing_price;

  -- Check if auction exists
  IF v_auction_status IS NULL THEN
    RETURN QUERY SELECT false, NULL::NUMERIC, NULL::NUMERIC, NULL::VARCHAR, 'Auction not found'::TEXT;
    RETURN;
  END IF;

  -- Check if auction is active
  IF v_auction_status != 'active' THEN
    RETURN QUERY SELECT false, v_current_highest, NULL::NUMERIC, v_auction_status, 'Auction is not active'::TEXT;
    RETURN;
  END IF;

  -- Check if auction has ended
  IF v_end_time < NOW() THEN
    RETURN QUERY SELECT false, v_current_highest, NULL::NUMERIC, v_auction_status, 'Auction has ended'::TEXT;
    RETURN;
  END IF;

  -- Calculate minimum required using tiered logic
  IF v_current_highest = 0 THEN
    v_minimum_required := GREATEST(v_start_bid, v_listing_price);
  ELSE
    IF v_current_highest < 0.1 THEN
      v_minimum_required := v_current_highest + 0.0001;
    ELSIF v_current_highest < 1 THEN
      v_minimum_required := v_current_highest + GREATEST(0.001, v_current_highest * 0.01);
    ELSIF v_current_highest < 10 THEN
      v_minimum_required := v_current_highest + GREATEST(0.01, v_current_highest * 0.005);
    ELSE
      v_minimum_required := v_current_highest + GREATEST(0.1, v_current_highest * 0.0025);
    END IF;
  END IF;

  -- Validate the proposed bid
  IF p_proposed_bid <= v_minimum_required THEN
    RETURN QUERY SELECT 
      false, 
      v_current_highest, 
      v_minimum_required, 
      v_auction_status,
      'Bid must exceed ' || v_minimum_required::TEXT || ' ETH'::TEXT;
  ELSE
    RETURN QUERY SELECT 
      true, 
      v_current_highest, 
      v_minimum_required, 
      v_auction_status,
      NULL::TEXT;
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT false, NULL::NUMERIC, NULL::NUMERIC, NULL::VARCHAR, 'Error: ' || SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Grant permissions (adjust roles as needed for your setup)
-- ============================================================================
GRANT EXECUTE ON FUNCTION validate_and_place_bid TO authenticated;
GRANT EXECUTE ON FUNCTION get_auction_highest_bid TO authenticated;
GRANT EXECUTE ON FUNCTION validate_bid_against_auction TO authenticated;

-- Note: Make sure the 'bids' and 'auctions' tables allow row-level access through RLS policies
-- The RPC functions will execute with the authenticated user's context
