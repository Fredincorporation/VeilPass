-- Original: DATABASE_MIGRATIONS_ADD_AUCTION_CUTOFF.sql
-- Migration: Add auction_cutoff_time to track when bidding must close
-- Purpose: Enforce 5-hour pre-event closure to allow settlement time

ALTER TABLE auctions
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS cutoff_time TIMESTAMP WITH TIME ZONE;

-- Function to calculate and update cutoff_time based on event date
CREATE OR REPLACE FUNCTION update_auction_cutoff()
RETURNS TRIGGER AS $$
BEGIN
  NEW.cutoff_time := (
    SELECT (e.date::timestamp - INTERVAL '5 hours')
    FROM tickets t
    JOIN events e ON e.id = t.event_id
    WHERE t.id = NEW.ticket_id
    LIMIT 1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_auction_cutoff ON auctions;

CREATE TRIGGER trigger_update_auction_cutoff
BEFORE INSERT ON auctions
FOR EACH ROW
EXECUTE FUNCTION update_auction_cutoff();

CREATE INDEX IF NOT EXISTS idx_auctions_cutoff_time ON auctions(cutoff_time);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);

UPDATE auctions
SET cutoff_time = (
  SELECT (e.date::timestamp - INTERVAL '5 hours')
  FROM tickets t
  JOIN events e ON e.id = t.event_id
  WHERE t.id = auctions.ticket_id
  LIMIT 1
)
WHERE cutoff_time IS NULL;
