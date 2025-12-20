-- Update event status constraint to use 'On Sale' instead of 'Live Auction'
-- Run this in your Supabase SQL editor

-- Step 1: Drop the existing constraint
ALTER TABLE events DROP CONSTRAINT events_status_check;

-- Step 2: Add the new constraint with 'On Sale' instead of 'Live Auction'
ALTER TABLE events ADD CONSTRAINT events_status_check 
  CHECK (status IN ('Pre-Sale', 'On Sale', 'Almost Sold Out', 'Finished', 'Rejected'));

-- Step 3: Update any existing 'Live Auction' statuses to 'On Sale'
UPDATE events
SET status = 'On Sale'
WHERE status = 'Live Auction';

-- Step 4: Verify the changes
SELECT id, title, status, created_at FROM events ORDER BY created_at DESC LIMIT 10;
