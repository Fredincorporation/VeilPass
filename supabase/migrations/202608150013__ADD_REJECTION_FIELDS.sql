-- Original: ADD_REJECTION_FIELDS.sql
-- Add rejection tracking fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE events ADD CONSTRAINT events_status_check 
  CHECK (status IN ('Pre-Sale', 'On Sale', 'Almost Sold Out', 'Finished', 'Rejected'));

CREATE INDEX IF NOT EXISTS idx_events_rejection_reason ON events(rejection_reason);
