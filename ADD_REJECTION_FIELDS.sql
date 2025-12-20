-- Add rejection tracking fields to events table
ALTER TABLE events ADD COLUMN rejection_reason TEXT;
ALTER TABLE events ADD COLUMN rejected_at TIMESTAMP;

-- Update status constraint to include 'Rejected' status
ALTER TABLE events DROP CONSTRAINT events_status_check;
ALTER TABLE events ADD CONSTRAINT events_status_check 
  CHECK (status IN ('Pre-Sale', 'On Sale', 'Almost Sold Out', 'Finished', 'Rejected'));

-- Create index on rejection_reason for faster queries
CREATE INDEX idx_events_rejection_reason ON events(rejection_reason);
