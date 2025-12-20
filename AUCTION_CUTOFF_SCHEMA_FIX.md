# Auction Cutoff Schema Fix

## Issue
The initial migration for the 5-hour pre-event auction cutoff had incorrect column references:
- Migration was trying to query `events.start_date` which doesn't exist
- The actual events table has a `date` column (not `start_date`)
- The auctions table references tickets via `ticket_id`, not directly to events

## Root Cause
Schema assumption error: The implementation assumed `events` table had a `start_date` column, but the actual schema uses `date`.

## Changes Made

### 1. Fixed Database Migration (`DATABASE_MIGRATIONS_ADD_AUCTION_CUTOFF.sql`)
**Before:**
```sql
NEW.cutoff_time := (
  SELECT (e.start_date - INTERVAL '5 hours')
  FROM events e
  WHERE e.id = NEW.ticket_id  -- ❌ Wrong: ticket_id is not an event_id
  LIMIT 1
);
```

**After:**
```sql
NEW.cutoff_time := (
  SELECT (e.date::timestamp - INTERVAL '5 hours')
  FROM tickets t
  JOIN events e ON e.id = t.event_id
  WHERE t.id = NEW.ticket_id  -- ✓ Correct: Matches tickets table
  LIMIT 1
);
```

**Key Corrections:**
- Changed `e.start_date` → `e.date::timestamp` (actual column name)
- Added proper join: `tickets t JOIN events e ON e.id = t.event_id`
- Fixed WHERE clause to properly reference tickets table
- Applied same fix to backfill UPDATE query

### 2. Fixed API Validation (`src/app/api/auctions/route.ts`)
**Before:**
```typescript
const { data: eventData } = await supabase
  .from('events')
  .select('start_date')
  .eq('id', ticketData.event_id)
  .single();

if (eventData?.start_date) {
  const eventStart = new Date(eventData.start_date);
```

**After:**
```typescript
const { data: eventData } = await supabase
  .from('events')
  .select('date')
  .eq('id', ticketData.event_id)
  .single();

if (eventData?.date) {
  const eventStart = new Date(eventData.date);
```

### 3. Fixed UI Ticket References (`src/app/tickets/page.tsx`)
**Before:**
```typescript
const eventStart = ticket.event?.start_date || ticket.start_date;
```

**After:**
```typescript
const eventStart = ticket.events?.date;
```

**Note:** The API returns tickets with `ticket.events` (nested object), not `ticket.event`, and the date field is `date` (not `start_date`).

## Database Schema Reference

### Events Table
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,           -- ← Use this column (not start_date)
  location TEXT NOT NULL,
  base_price DECIMAL NOT NULL,
  ...
);
```

### Tickets Table
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id),  -- ← Links to events
  owner_address TEXT NOT NULL,
  ...
);
```

### Auctions Table
```sql
CREATE TABLE auctions (
  id UUID PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES tickets(id),  -- ← Links to tickets, not events
  status TEXT DEFAULT 'active',                     -- ← Added by migration
  cutoff_time TIMESTAMP WITH TIME ZONE,             -- ← Added by migration
  ...
);
```

## Relationship Chain
```
auctions.ticket_id → tickets.id
tickets.event_id → events.id
events.date → Cutoff = date - 5 hours
```

## Next Steps
1. Apply the corrected migration to Supabase using the fixed SQL
2. Verify that:
   - `auctions.status` column exists with default 'active'
   - `auctions.cutoff_time` column exists
   - Trigger `trigger_update_auction_cutoff` is created
   - Indexes are created on `cutoff_time` and `status`
3. Test end-to-end with a real event

## Verification Query
```sql
-- Check that auctions have correct cutoff times
SELECT 
  a.id,
  a.ticket_id,
  t.event_id,
  e.date,
  a.cutoff_time,
  (e.date::timestamp - INTERVAL '5 hours') as expected_cutoff
FROM auctions a
JOIN tickets t ON t.id = a.ticket_id
JOIN events e ON e.id = t.event_id
LIMIT 5;
```

All values in `a.cutoff_time` should match `expected_cutoff`.
