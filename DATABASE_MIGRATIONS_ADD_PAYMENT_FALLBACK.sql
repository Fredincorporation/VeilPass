-- filepath: DATABASE_MIGRATIONS_ADD_PAYMENT_FALLBACK.sql
-- Migration: Add payment deadline and fallback tracking to auction_results
-- Purpose: Implement post-settlement payment window with fallback to next-highest bidder
-- Date: 2025-12-20

-- ============================================================================
-- Update auction_results table with payment deadline and fallback tracking
-- ============================================================================

ALTER TABLE auction_results
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_payment',
ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_received_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fallback_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_fallback_winner BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS previous_winner_address TEXT,
ADD COLUMN IF NOT EXISTS fallback_reason TEXT,
ADD COLUMN IF NOT EXISTS fallback_timestamp TIMESTAMP WITH TIME ZONE;

-- Add check constraint for valid status values
ALTER TABLE auction_results
DROP CONSTRAINT IF EXISTS auction_results_status_check;

ALTER TABLE auction_results
ADD CONSTRAINT auction_results_status_check 
CHECK (status IN (
  'pending_payment',      -- Winner notified, awaiting payment
  'paid',                 -- Payment received
  'failed_payment',       -- Winner failed to pay within deadline
  'fallback_offered',     -- Fallback offer sent to next bidder
  'fallback_accepted',    -- Next bidder accepted fallback offer
  'fallback_rejected',    -- Next bidder rejected fallback
  'failed_all_fallbacks', -- All fallback attempts exhausted
  'cancelled'             -- Auction cancelled
));

-- ============================================================================
-- Create payment_fallback_log table to track fallback attempts
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_fallback_log (
  id BIGSERIAL PRIMARY KEY,
  auction_id TEXT NOT NULL,
  auction_result_id BIGINT NOT NULL REFERENCES auction_results(id),
  previous_winner_address TEXT NOT NULL,
  fallback_bidder_address TEXT NOT NULL,
  fallback_amount NUMERIC NOT NULL,
  fallback_commitment_id BIGINT,
  offer_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  offer_expires_at TIMESTAMP WITH TIME ZONE,
  response_timestamp TIMESTAMP WITH TIME ZONE,
  response_status TEXT,  -- 'accepted', 'rejected', 'expired'
  payment_deadline TIMESTAMP WITH TIME ZONE,
  payment_received_at TIMESTAMP WITH TIME ZONE,
  final_status TEXT,     -- 'paid', 'failed', 'rejected'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fallback_log_auction ON payment_fallback_log(auction_id);
CREATE INDEX IF NOT EXISTS idx_fallback_log_result ON payment_fallback_log(auction_result_id);
CREATE INDEX IF NOT EXISTS idx_fallback_log_bidder ON payment_fallback_log(fallback_bidder_address);
CREATE INDEX IF NOT EXISTS idx_fallback_log_status ON payment_fallback_log(response_status);

-- ============================================================================
-- Create auction_results table if it doesn't exist with full schema
-- ============================================================================

-- Note: If this table already exists, the above ALTER statements will add missing columns
-- If it doesn't exist, uncomment and run the below:

/*
CREATE TABLE IF NOT EXISTS auction_results (
  id BIGSERIAL PRIMARY KEY,
  auction_id TEXT NOT NULL,
  winner_address TEXT NOT NULL,
  winning_amount NUMERIC NOT NULL,
  commitment_id BIGINT,
  status TEXT DEFAULT 'pending_payment',
  payment_deadline TIMESTAMP WITH TIME ZONE,
  payment_received_at TIMESTAMP WITH TIME ZONE,
  fallback_count INT DEFAULT 0,
  is_fallback_winner BOOLEAN DEFAULT FALSE,
  previous_winner_address TEXT,
  fallback_reason TEXT,
  fallback_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT auction_results_status_check CHECK (status IN (
    'pending_payment',
    'paid',
    'failed_payment',
    'fallback_offered',
    'fallback_accepted',
    'fallback_rejected',
    'failed_all_fallbacks',
    'cancelled'
  ))
);

CREATE INDEX IF NOT EXISTS idx_auction_results_auction_id ON auction_results(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_results_winner ON auction_results(winner_address);
CREATE INDEX IF NOT EXISTS idx_auction_results_status ON auction_results(status);
CREATE INDEX IF NOT EXISTS idx_auction_results_deadline ON auction_results(payment_deadline);
*/

-- ============================================================================
-- Function to get next highest bidders for fallback
-- ============================================================================

CREATE OR REPLACE FUNCTION get_fallback_bidders(
  p_auction_id TEXT,
  p_exclude_address TEXT,
  p_limit INT DEFAULT 3
)
RETURNS TABLE (
  bidder_address TEXT,
  revealed_amount NUMERIC,
  commitment_id BIGINT,
  revealed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.bidder_address,
    ac.revealed_amount,
    ac.id,
    ac.created_at
  FROM auction_commitments ac
  WHERE ac.auction_id = p_auction_id
    AND ac.revealed = true
    AND ac.revealed_amount > 0
    AND ac.bidder_address != p_exclude_address
  ORDER BY ac.revealed_amount DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to mark payment as received and close auction_results
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_payment_received(
  p_auction_result_id BIGINT,
  p_payment_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  -- Fetch current status
  SELECT status INTO v_current_status
  FROM auction_results
  WHERE id = p_auction_result_id;

  IF v_current_status IS NULL THEN
    RETURN QUERY SELECT false::BOOLEAN, 'Auction result not found'::TEXT;
    RETURN;
  END IF;

  IF v_current_status NOT IN ('pending_payment', 'fallback_accepted') THEN
    RETURN QUERY SELECT false::BOOLEAN, 'Auction result is not pending payment'::TEXT;
    RETURN;
  END IF;

  -- Mark as paid
  UPDATE auction_results
  SET 
    status = 'paid',
    payment_received_at = p_payment_timestamp
  WHERE id = p_auction_result_id;

  RETURN QUERY SELECT true::BOOLEAN, 'Payment marked as received'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT SELECT ON payment_fallback_log TO authenticated;
GRANT SELECT ON auction_results TO authenticated;
GRANT EXECUTE ON FUNCTION get_fallback_bidders TO authenticated;
GRANT EXECUTE ON FUNCTION mark_payment_received TO authenticated;
GRANT EXECUTE ON FUNCTION get_fallback_bidders(TEXT, TEXT, INT) TO service_role;
GRANT EXECUTE ON FUNCTION mark_payment_received(BIGINT, TIMESTAMP WITH TIME ZONE) TO service_role;
