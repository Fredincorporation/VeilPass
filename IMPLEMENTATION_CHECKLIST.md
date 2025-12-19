# API Routes & Database Tables - Implementation Checklist

## Missing API Routes to Create

### Priority 1: Critical Routes

#### 1. **Wishlists** (`/src/app/api/wishlists/`)
- `route.ts` - GET/POST wishlists
- `[id]/route.ts` - DELETE specific wishlist

**Handler Logic:**
```typescript
// GET: Fetch wishlists by user
const userAddress = searchParams.get('user');
const wishlists = await supabase
  .from('wishlists')
  .select('*')
  .eq('user_address', userAddress);

// POST: Add to wishlist
const { user_address, event_id } = req.body;
await supabase.from('wishlists').insert([{ user_address, event_id }]);

// DELETE: Remove from wishlist
await supabase.from('wishlists').delete().eq('id', id);
```

#### 2. **Notifications** (`/src/app/api/notifications/`)
- `route.ts` - GET/PUT notifications
- `[id]/route.ts` - PUT/DELETE specific notification

**Handler Logic:**
```typescript
// GET: Fetch user notifications
const notifications = await supabase
  .from('notifications')
  .select('*')
  .eq('user_address', userAddress);

// PUT: Mark as read
await supabase
  .from('notifications')
  .update({ read: true })
  .eq('id', id);

// DELETE: Delete notification
await supabase.from('notifications').delete().eq('id', id);
```

#### 3. **Disputes** (`/src/app/api/disputes/`)
- `route.ts` - GET/POST disputes
- `[id]/route.ts` - PUT specific dispute

**Handler Logic:**
```typescript
// POST: Create dispute
const { ticket_id, user_address, reason, description } = req.body;
await supabase.from('disputes').insert([{
  ticket_id,
  user_address,
  reason,
  description,
  status: 'OPEN'
}]);

// PUT: Update dispute
await supabase
  .from('disputes')
  .update({ status, updated_at: new Date() })
  .eq('id', id);
```

#### 4. **Event Detail** (`/src/app/api/events/[id]/`)
- `route.ts` - GET specific event
- `reviews/route.ts` - GET/POST event reviews

**Handler Logic:**
```typescript
// GET: Fetch single event
const event = await supabase
  .from('events')
  .select('*')
  .eq('id', eventId)
  .single();
```

#### 5. **Loyalty** (`/src/app/api/loyalty/`)
- `redeemables/route.ts` - GET redeemable items
- `redeem/route.ts` - POST redeem points
- `history/route.ts` - GET redemption history

**Handler Logic:**
```typescript
// GET redeemables: Static data or from table
const redeemables = [
  { id: 1, title: '10% Discount', points: 500 },
  { id: 2, title: 'VIP Upgrade', points: 1000 },
  { id: 3, title: '$25 Credit', points: 2500 }
];

// POST redeem: Update user loyalty points
const { userAddress, redeemableId, pointsUsed } = req.body;
const { data: user } = await supabase
  .from('users')
  .select('loyalty_points')
  .eq('wallet_address', userAddress)
  .single();

await supabase
  .from('users')
  .update({ loyalty_points: user.loyalty_points - pointsUsed })
  .eq('wallet_address', userAddress);
```

#### 6. **Seller Events** (`/src/app/api/seller/`)
- `events/route.ts` - GET/POST/PUT seller events
- `analytics/route.ts` - GET seller analytics

**Handler Logic:**
```typescript
// GET seller events
const events = await supabase
  .from('events')
  .select('*')
  .eq('organizer', sellerAddress);

// POST: Create event
const newEvent = { title, date, location, base_price, capacity, organizer: sellerAddress };
await supabase.from('events').insert([newEvent]);

// GET analytics
const events = await supabase
  .from('events')
  .select('*')
  .eq('organizer', sellerAddress);

const revenue = events.reduce((sum, e) => sum + e.revenue, 0);
const ticketsSold = events.reduce((sum, e) => sum + e.tickets_sold, 0);
```

#### 7. **Admin Routes** (`/src/app/api/admin/`)
- `disputes/route.ts` - GET/PUT disputes (admin view)
- `disputes/[id]/route.ts` - PUT update dispute
- `sellers/route.ts` - GET/PUT seller approvals
- `seller-ids/route.ts` - GET seller IDs
- `audit-logs/route.ts` - GET audit logs

**Handler Logic:**
```typescript
// GET admin disputes (all disputes)
const disputes = await supabase
  .from('disputes')
  .select('*')
  .filter('status', status);

// PUT update dispute status
await supabase
  .from('disputes')
  .update({ status, resolution })
  .eq('id', id);

// GET sellers (all sellers awaiting verification)
const sellers = await supabase
  .from('seller_verifications')
  .select('*')
  .filter('status', status);

// PUT approve seller
await supabase
  .from('seller_verifications')
  .update({ status: 'APPROVED' })
  .eq('id', sellerId);
```

---

## Missing Supabase Tables to Create

### Run These SQL Queries in Supabase SQL Editor

#### 1. **Wishlists Table**
```sql
CREATE TABLE IF NOT EXISTS wishlists (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_address TEXT NOT NULL,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_address, event_id)
);

CREATE INDEX idx_wishlists_user ON wishlists(user_address);
```

#### 2. **Notifications Table**
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_address TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_address);
CREATE INDEX idx_notifications_read ON notifications(user_address, read);
```

#### 3. **Disputes Table** (if not already created)
```sql
CREATE TABLE IF NOT EXISTS disputes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ticket_id TEXT NOT NULL,
  user_address TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN',
  resolution TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_disputes_user ON disputes(user_address);
CREATE INDEX idx_disputes_status ON disputes(status);
```

#### 4. **Seller Verifications Table** (if not already created)
```sql
CREATE TABLE IF NOT EXISTS seller_verifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  wallet_address TEXT,
  status TEXT DEFAULT 'PENDING',
  kyc_status TEXT DEFAULT 'NOT_VERIFIED',
  business_type TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_seller_status ON seller_verifications(status);
```

#### 5. **Audit Logs Table**
```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  target TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  details TEXT
);

CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_actor ON audit_logs(actor);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
```

#### 6. **Seller IDs Table** (for KYC)
```sql
CREATE TABLE IF NOT EXISTS seller_ids (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  seller_id BIGINT NOT NULL REFERENCES seller_verifications(id),
  id_type TEXT NOT NULL,
  encrypted_id TEXT NOT NULL,
  verification_score INTEGER,
  status TEXT DEFAULT 'PENDING',
  submitted_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP
);

CREATE INDEX idx_seller_ids_status ON seller_ids(status);
```

---

## Implementation Checklist

### API Routes
- [ ] `/api/wishlists/route.ts`
- [ ] `/api/wishlists/[id]/route.ts`
- [ ] `/api/notifications/route.ts`
- [ ] `/api/notifications/[id]/route.ts`
- [ ] `/api/disputes/route.ts`
- [ ] `/api/disputes/[id]/route.ts`
- [ ] `/api/events/[id]/route.ts`
- [ ] `/api/events/[id]/reviews/route.ts`
- [ ] `/api/loyalty/redeemables/route.ts`
- [ ] `/api/loyalty/redeem/route.ts`
- [ ] `/api/loyalty/history/route.ts`
- [ ] `/api/seller/events/route.ts`
- [ ] `/api/seller/analytics/route.ts`
- [ ] `/api/admin/disputes/route.ts`
- [ ] `/api/admin/disputes/[id]/route.ts`
- [ ] `/api/admin/sellers/route.ts`
- [ ] `/api/admin/sellers/[id]/route.ts`
- [ ] `/api/admin/seller-ids/route.ts`
- [ ] `/api/admin/audit-logs/route.ts`

### Database Tables
- [ ] Create `wishlists` table
- [ ] Create `notifications` table
- [ ] Create `disputes` table
- [ ] Create `seller_verifications` table
- [ ] Create `audit_logs` table
- [ ] Create `seller_ids` table (KYC)
- [ ] Create indexes on all tables
- [ ] Enable RLS policies (optional)

---

## Quick Start for Creating Routes

### Template for New API Route

```typescript
// /src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user = searchParams.get('user');
    
    const { data, error } = await supabase
      .from('TABLE_NAME')
      .select('*')
      .eq('user_address', user);
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('TABLE_NAME')
      .insert([body])
      .select();
    
    if (error) throw error;
    
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Validation Requirements

All new routes should include:
- [x] Input validation (body/params)
- [x] Auth checks (if needed)
- [x] Error handling with proper status codes
- [x] Request logging (optional)
- [x] Rate limiting (future)

---

## Testing After Implementation

For each new route:
1. Test GET with valid params
2. Test GET with invalid params
3. Test POST with valid body
4. Test POST with invalid body
5. Test PUT/DELETE operations
6. Test error cases
7. Verify data is saved to Supabase
8. Verify hooks receive data correctly

---

**This checklist covers all remaining implementation work!**
