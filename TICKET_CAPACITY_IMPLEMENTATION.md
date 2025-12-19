# Ticket/Bid Capacity & Sales Tracking Implementation

## Summary of Changes

This implementation adds complete ticket/bid tracking, capacity management, and occupancy calculations to the VeilPass system.

## ✅ Changes Made to Codebase

### 1. **Database Schema Updates** (TypeScript Types)
- **File**: `src/lib/supabase.ts`
- Updated `Event` interface to include:
  - `capacity: number` (integer representing max tickets)
  - `tickets_sold: number` (auto-tracked count)
  - `updated_at: string` (update timestamp)

### 2. **Frontend Calculations** (Seller Events Page)
- **File**: `src/app/seller/events/page.tsx`
- Added helper functions:
  - `getAttendees(event)` - Returns tickets_sold
  - `getRevenue(event)` - Calculates: base_price * tickets_sold (in ETH)
  - `getOccupancy(event)` - Calculates: (tickets_sold / capacity) * 100
  - `formatEventDate()` - Formats ISO dates to readable format
  - `formatEventTime()` - Extracts time from ISO dates

### 3. **Edit Event Page Updates**
- **File**: `src/app/seller/events/edit/[eventName]/page.tsx`
- Added `capacity` field to form data
- Added capacity input field to the form UI
- Updates include capacity when saving events
- Loads capacity from existing events

### 4. **Events Page Occupancy** 
- **File**: `src/app/events/page.tsx`
- Updated occupancy calculation to use numeric capacity
- Shows format: "X / Y tickets" available
- Fixed carousel to calculate occupancy correctly

### 5. **Homepage Carousel**
- **File**: `src/app/page.tsx`
- Updated featured events carousel occupancy calculation
- Now properly handles numeric capacity values

### 6. **API Endpoints for Stats**
- **File**: `src/app/api/events/[eventId]/tickets/route.ts` (NEW)
  - GET endpoint to count active tickets for an event
  - Returns: `{ count: number }`

- **File**: `src/app/api/events/[eventId]/bids/route.ts` (NEW)
  - GET endpoint to count active bids for an event
  - Returns: `{ count: number }`

### 7. **React Query Hook**
- **File**: `src/hooks/useEventStats.ts` (NEW)
- Hooks for fetching ticket and bid counts:
  - `useEventTicketCount(eventId)` 
  - `useEventBidsCount(eventId)`

### 8. **PUT Endpoint for Events**
- **File**: `src/app/api/events/route.ts`
- Added PUT handler for updating events
- Accepts: id, title, description, date, location, base_price, capacity
- Auto-timestamps updates

## 📊 Database Setup Required

You need to run the following SQL queries in your Supabase SQL editor. The complete script is available in: `DATABASE_MIGRATIONS.sql`

### Key SQL Commands:

```sql
-- Add columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tickets_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  buyer_address VARCHAR(255),
  price DECIMAL(20, 8),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  bidder_address VARCHAR(255),
  bid_amount DECIMAL(20, 8),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create auto-update function (optional but recommended)
CREATE OR REPLACE FUNCTION update_event_tickets_sold()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events 
  SET tickets_sold = (
    SELECT COUNT(*) FROM tickets 
    WHERE event_id = NEW.event_id AND status = 'active'
  )
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-update
DROP TRIGGER IF EXISTS trigger_update_tickets_sold ON tickets;
CREATE TRIGGER trigger_update_tickets_sold
AFTER INSERT OR UPDATE OR DELETE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_event_tickets_sold();
```

## 🔄 How It Works

### Occupancy Calculation:
```
occupancy% = (tickets_sold / capacity) * 100
available_tickets = capacity - tickets_sold
```

### Revenue Calculation:
```
revenue = base_price * tickets_sold (displayed in ETH)
```

### Attendees Count:
```
attendees = tickets_sold
```

## 📍 UI Updates

1. **Seller Events Page**: Shows occupancy bar, attendee count, and revenue
2. **Edit Event Form**: Allows setting event capacity
3. **Events Listing**: Shows availability percentage and ticket count
4. **Homepage Carousel**: Displays occupancy for featured events

## 🚀 Integration Points

The system is ready to be integrated with:
- Ticket purchase flow (creates entries in `tickets` table)
- Bid/auction system (creates entries in `bids` table)
- Existing `useSellerEvents` hook (displays ticket count automatically)

When users purchase tickets or place bids, just insert records into the respective tables, and the `tickets_sold` count will automatically update via the trigger.

## ✨ Features

✅ Capacity management  
✅ Automatic ticket count tracking  
✅ Real-time occupancy percentage  
✅ Revenue calculations  
✅ Attendee tracking  
✅ Database triggers for auto-updates  
✅ Formatted date/time display  
✅ ETH to USDT price conversion  

## 📝 Next Steps

1. Run the SQL migrations from `DATABASE_MIGRATIONS.sql` in Supabase
2. Update existing events with capacity values
3. Integrate ticket purchase flow to insert into `tickets` table
4. Integrate bid system to insert into `bids` table
5. Test the occupancy calculations on the UI
