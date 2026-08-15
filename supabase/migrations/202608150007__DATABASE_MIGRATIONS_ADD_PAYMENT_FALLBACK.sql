-- Original: DATABASE_MIGRATIONS_ADD_PAYMENT_FALLBACK.sql
-- Migration for payment fallback handling on auction results

ALTER TABLE auction_results
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_payment',
ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_received_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fallback_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_fallback_winner BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS previous_winner_address TEXT,
ADD COLUMN IF NOT EXISTS fallback_reason TEXT,
ADD COLUMN IF NOT EXISTS fallback_timestamp TIMESTAMP WITH TIME ZONE;

ALTER TABLE auction_results
DROP CONSTRAINT IF EXISTS auction_results_status_check;

ALTER TABLE auction_results
ADD CONSTRAINT auction_results_status_check 
CHECK (status IN (
  'pending_payment',
  'paid',
  'failed_payment',
  'fallback_offered',
  'fallback_accepted',
  'fallback_rejected',
  'failed_all_fallbacks',
  'cancelled'
));

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
  response_status TEXT,
  payment_deadline TIMESTAMP WITH TIME ZONE,
  payment_received_at TIMESTAMP WITH TIME ZONE,
  final_status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fallback_log_auction ON payment_fallback_log(auction_id);
CREATE INDEX IF NOT EXISTS idx_fallback_log_result ON payment_fallback_log(auction_result_id);
CREATE INDEX IF NOT EXISTS idx_fallback_log_bidder ON payment_fallback_log(fallback_bidder_address);
CREATE INDEX IF NOT EXISTS idx_fallback_log_status ON payment_fallback_log(response_status);
