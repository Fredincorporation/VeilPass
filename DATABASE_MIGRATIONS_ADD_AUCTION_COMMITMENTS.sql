-- Migration: Create auction_commitments table
-- Purpose: Store EIP-712 signed commitments for commit->reveal auctions

CREATE TABLE IF NOT EXISTS auction_commitments (
  id BIGSERIAL PRIMARY KEY,
  auction_id TEXT NOT NULL,
  bidder_address TEXT NOT NULL,
  commitment TEXT NOT NULL,
  signature TEXT NOT NULL,
  nonce BIGINT DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  revealed BOOLEAN DEFAULT false,
  revealed_amount NUMERIC,
  reveal_secret TEXT,
  reveal_tx_hash TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auction_bidder_unique ON auction_commitments(auction_id, bidder_address);
CREATE INDEX IF NOT EXISTS idx_auction_commitments_auction_id ON auction_commitments(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_commitments_commitment ON auction_commitments(commitment);
