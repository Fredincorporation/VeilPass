-- Migration: Create auction_results table
-- Purpose: Store auction settlement results (winners)

CREATE TABLE IF NOT EXISTS auction_results (
  id BIGSERIAL PRIMARY KEY,
  auction_id TEXT NOT NULL,
  winner_address TEXT NOT NULL,
  winning_amount NUMERIC NOT NULL,
  commitment_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auction_results_auction_id ON auction_results(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_results_winner ON auction_results(winner_address);
