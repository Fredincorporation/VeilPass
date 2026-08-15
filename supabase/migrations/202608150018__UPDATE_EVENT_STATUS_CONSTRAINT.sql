-- Original: UPDATE_EVENT_STATUS_CONSTRAINT.sql
-- Update event status constraint to use 'On Sale'

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;

ALTER TABLE events ADD CONSTRAINT events_status_check 
  CHECK (status IN ('Pre-Sale', 'On Sale', 'Almost Sold Out', 'Finished', 'Rejected'));

UPDATE events
SET status = 'On Sale'
WHERE status = 'Live Auction';
