-- Fix Invalid Organizer Addresses in Events Table
-- Run this in Supabase SQL Editor

-- Show current events with invalid organizer addresses
SELECT id, title, organizer, created_at 
FROM events 
WHERE organizer IS NOT NULL 
  AND organizer != ''
  AND (organizer NOT LIKE '0x%' OR LENGTH(organizer) != 42)
ORDER BY created_at DESC;

-- Update all events with invalid organizer addresses to use the correct wallet
-- Replace 0x38208Fa62a8B150B8A1fa4e277ab1bAdb3ba756B with your actual wallet address if different
UPDATE events 
SET organizer = '0x38208Fa62a8B150B8A1fa4e277ab1bAdb3ba756B'
WHERE organizer IS NOT NULL 
  AND organizer != ''
  AND (organizer NOT LIKE '0x%' OR LENGTH(organizer) != 42);

-- Verify the fix
SELECT id, title, organizer, created_at 
FROM events 
WHERE organizer = '0x38208Fa62a8B150B8A1fa4e277ab1bAdb3ba756B'
ORDER BY created_at DESC;
