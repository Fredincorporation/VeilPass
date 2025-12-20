# Fix for $0 Revenue Issue - Ticket Prices Not Set

## Problem Identified

Your tickets are showing $0 revenue because:

1. **Events have `base_price = 0`** - When creating your events, the base price wasn't set
2. **Tickets inherit the 0 price** - When users purchase tickets, they get `price: 0`
3. **Revenue calculation sums 0s** - Total revenue = 0 + 0 + ... = 0.00 ETH

## Solution

There are two approaches:

### Option A: Update Existing Ticket Prices (Quick Fix)

Run this SQL in Supabase to set ticket prices based on their event's base_price:

```sql
-- Update tickets with price from their associated event
UPDATE tickets t
SET price = COALESCE(e.base_price, 0.1)
FROM events e
WHERE t.event_id = e.id AND t.price = 0;

-- Verify the update
SELECT 
  e.id as event_id,
  e.title,
  e.base_price,
  COUNT(t.id) as ticket_count,
  SUM(t.price) as total_revenue
FROM events e
LEFT JOIN tickets t ON e.id = t.event_id
WHERE t.price > 0
GROUP BY e.id, e.title, e.base_price
ORDER BY e.created_at DESC;
```

### Option B: Update Event Base Prices (Proper Fix)

If your events have `base_price = 0`, update them first:

```sql
-- Update events with proper prices (adjust 0.25 to your desired price)
UPDATE events
SET base_price = 0.25  -- Change to your desired ticket price
WHERE base_price = 0 OR base_price IS NULL;

-- Then update tickets to match
UPDATE tickets t
SET price = COALESCE(e.base_price, 0.1)
FROM events e
WHERE t.event_id = e.id AND t.price = 0;
```

### Option C: Set Specific Prices per Event

```sql
-- Update specific event to have a different price
UPDATE events SET base_price = 0.5 WHERE title = 'Your Event Title Here';

-- Update its tickets
UPDATE tickets t
SET price = 0.5
FROM events e
WHERE t.event_id = e.id AND e.title = 'Your Event Title Here';
```

## How to Run SQL in Supabase

1. Go to **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Paste the SQL from above
5. Click **Run** ▶️
6. Check the verification query results

## Verification

After running the fix, your revenue should show correctly:

1. Go to **Seller Dashboard** → **Events**
2. Check "Total Revenue" - should now show the actual amount (not 0.00 ETH)
3. Verify "Total Attendees" still shows the correct count

## Example Output

Before fix:
```
Total Revenue: 0.00 ETH
Total Attendees: 2
```

After fix (if you set prices to 0.25 ETH):
```
Total Revenue: 0.50 ETH  (2 tickets × 0.25 ETH)
Total Attendees: 2
```

## Prevention for Future Events

When creating new events, **always set the base_price** on Step 3 (Pricing & Image):

1. Go to **Seller Dashboard** → **Create Event**
2. Fill all steps (Event Details, Schedule, Location, Capacity)
3. **Step 3 - Pricing & Image**: Enter your ticket price in the "Price per ticket (ETH)" field
4. Create the event

This ensures all future tickets are created with the correct price.

## Need Help?

If you're not sure what price to set:
- Run the verification query above to see current event/ticket data
- Look at the `base_price` column in the results
- Decide on a price (e.g., 0.25 ETH, 0.5 ETH, 1.0 ETH)
- Apply Option B with your chosen price
