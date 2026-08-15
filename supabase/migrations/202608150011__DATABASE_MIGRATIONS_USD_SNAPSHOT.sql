-- Original: DATABASE_MIGRATIONS_USD_SNAPSHOT.sql
-- Add USD snapshot columns for auctions and bids

ALTER TABLE IF EXISTS auctions
  ADD COLUMN IF NOT EXISTS listing_price_usd NUMERIC,
  ADD COLUMN IF NOT EXISTS start_bid_usd NUMERIC,
  ADD COLUMN IF NOT EXISTS reserve_price_usd NUMERIC;

ALTER TABLE IF EXISTS bids
  ADD COLUMN IF NOT EXISTS amount_usd NUMERIC;

CREATE INDEX IF NOT EXISTS idx_auctions_listing_price_usd ON auctions(listing_price_usd);
CREATE INDEX IF NOT EXISTS idx_bids_amount_usd ON bids(amount_usd);
