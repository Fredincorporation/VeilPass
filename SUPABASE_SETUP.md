# VeilPass Supabase Integration Checklist

## ✅ Completed Setup

### 1. Environment Variables
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Set in `.env.local`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Set in `.env.local`

### 2. Supabase Client
- ✅ Created `/src/lib/supabase.ts` with:
  - Supabase client initialization
  - TypeScript interfaces (User, Event, Ticket, Auction, Bid)
  - Database types definition

### 3. API Routes Created
- ✅ `/src/app/api/events/route.ts` - GET/POST events
- ✅ `/src/app/api/tickets/route.ts` - GET/POST/PUT tickets
- ✅ `/src/app/api/auctions/route.ts` - GET/POST auctions
- ✅ `/src/app/api/bids/route.ts` - GET/POST bids
- ✅ `/src/app/api/user/route.ts` - GET/PUT user profile

### 4. React Query Hooks Created
- ✅ `/src/hooks/useEvents.ts` - Fetch all events
- ✅ `/src/hooks/useTickets.ts` - Fetch, create, update tickets
- ✅ `/src/hooks/useAuctions.ts` - Fetch and create auctions
- ✅ `/src/hooks/useBids.ts` - Fetch and place bids
- ✅ `/src/hooks/useUser.ts` - Fetch and update user profile
- ✅ `/src/hooks/useWalletAuthentication.ts` - Wallet-based auth

### 5. React Query Provider
- ✅ Created `/src/lib/react-query.tsx` with QueryClient setup
- ✅ Updated `/src/lib/providers.tsx` to include ReactQueryProvider

### 6. Events Page Updated
- ✅ Replaced mock data with `useEvents()` hook
- ✅ Added loading state UI
- ✅ Added error state UI
- ✅ Updated event card to use `base_price` from Supabase
- ✅ Maintained filtering and search functionality

### 7. Dashboard Updated
- ✅ Integrated wallet authentication hook
- ✅ Auto-sync user profile from Supabase
- ✅ Loyalty points tracking ready
- ✅ User role management integrated

## 📋 Next Steps - Database Setup

### Step 1: Create Tables in Supabase
Go to https://app.supabase.com and run these SQL queries in the SQL Editor:

**Query 1: Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_wallet ON users(wallet_address);
```

**Query 2: Events Table**
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  image TEXT,
  base_price DECIMAL NOT NULL,
  capacity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pre-Sale' CHECK (status IN ('Pre-Sale', 'Live Auction', 'Almost Sold Out', 'Finished')),
  organizer TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_events_status ON events(status);
```

**Query 3: Tickets Table**
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id INTEGER NOT NULL REFERENCES events(id),
  owner_address TEXT NOT NULL,
  section TEXT,
  price DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'upcoming', 'sold', 'transferred')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tickets_owner ON tickets(owner_address);
CREATE INDEX idx_tickets_event ON tickets(event_id);
```

**Query 4: Auctions Table**
```sql
CREATE TABLE auctions (
  id SERIAL PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  seller_address TEXT NOT NULL,
  start_bid DECIMAL NOT NULL,
  listing_price DECIMAL NOT NULL,
  reserve_price DECIMAL,
  duration_hours INTEGER NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'sold')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_auctions_seller ON auctions(seller_address);
CREATE INDEX idx_auctions_status ON auctions(status);
```

**Query 5: Bids Table**
```sql
CREATE TABLE bids (
  id SERIAL PRIMARY KEY,
  auction_id INTEGER NOT NULL REFERENCES auctions(id),
  bidder_address TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_bids_bidder ON bids(bidder_address);
```

**Query 6: Broadcasts Table**
```sql
CREATE TABLE broadcasts (
  id SERIAL PRIMARY KEY,
  admin_address TEXT NOT NULL,
  message TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'seller')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 2: Add Sample Events Data
```sql
INSERT INTO events (title, description, date, location, image, base_price, capacity, status, organizer) VALUES
('Summer Music Fest', 'Experience the ultimate summer music festival with world-class artists and performances across 3 days.', 'Jun 15-17, 2025', 'Central Park, New York', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=400&fit=crop', 0.25, '5,250 / 10,000', 'Pre-Sale', 'Festival Productions Inc.'),
('Tech Conference 2025', 'Leading tech conference with industry experts', 'Jul 20-22, 2025', 'San Francisco, CA', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop', 0.5, '1,842 / 3,000', 'Pre-Sale', 'Tech Summit Ltd'),
('Comedy Night', 'Stand-up comedy featuring famous comedians', 'Jul 22, 2025', 'Theatre District, NYC', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=400&fit=crop', 0.15, '485 / 600', 'Live Auction', 'Comedy Productions');
```

### Step 3: Test the Connection
1. Run `npm run dev`
2. Go to http://localhost:3000/events
3. You should see the data loading from Supabase
4. Check browser console for any errors

### Step 4: Test Wallet Authentication
1. Connect your wallet
2. Check Supabase → Tables → users → A new user row should be created
3. Dashboard should load with user data

## 📊 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Components (Events, Tickets, Auctions, etc)   │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │  React Query Hooks (useEvents, useTickets, etc)      │   │
│  │  - Query state management                             │   │
│  │  - Automatic caching & refetching                    │   │
│  │  - Mutation handling                                 │   │
│  └────────────────┬─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                    │ axios
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Server                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes (/api/events, /api/tickets, etc)         │   │
│  │  - Request validation                                │   │
│  │  - Business logic                                    │   │
│  │  - Error handling                                    │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │  Supabase Client                                     │   │
│  │  - Connects to PostgreSQL database                  │   │
│  └────────────────┬─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                    │ TCP/SSL
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Cloud)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                 │   │
│  │  - users table                                       │   │
│  │  - events table                                      │   │
│  │  - tickets table                                     │   │
│  │  - auctions table                                    │   │
│  │  - bids table                                        │   │
│  │  - broadcasts table                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Security Notes

- ✅ Using `NEXT_PUBLIC_SUPABASE_ANON_KEY` - safe for public use
- ✅ Wallet address used as user identifier
- ✅ Row-level security (RLS) can be enabled in Supabase for additional protection
- ⚠️ Consider adding RLS policies for production

## 🚀 Features Ready to Use

1. **Events Management** - Fetch, display, filter events
2. **User Profiles** - Automatic wallet-based user creation
3. **Loyalty Points** - Track and update loyalty points
4. **Tickets** - Create, manage, list tickets for auction
5. **Auctions** - List, create, bid on auctions
6. **Real-time Updates** - React Query auto-refetch capability

## 📝 What to Do Next

1. ✅ Run the SQL queries in Supabase
2. ✅ Add sample event data
3. ✅ Test the connection by loading events page
4. ✅ Connect wallet and verify user creation
5. Create similar integrations for other pages:
   - Tickets page → useTickets hook
   - Auctions page → useAuctions hook
   - User settings → useUser hook
6. Add RLS (Row-Level Security) policies in Supabase for production

## 🐛 Troubleshooting

**Error: "NEXT_PUBLIC_SUPABASE_URL is missing"**
- Check `.env.local` has both URL and KEY

**Error: "Cannot POST /api/events"**
- Make sure you're using correct HTTP method in the hook

**Events not loading on page**
- Check browser console for API errors
- Verify Supabase connection string
- Ensure tables are created in Supabase

**User not being created**
- Check Supabase → users table
- Verify wallet authentication hook is running
- Check browser console for errors
