## Atomic Bid Validation & Bid Increment Configuration

### Overview

This feature implements two critical improvements to the auction system:

1. **Atomic Bid Validation (Server-Side RPC)**: Prevents race conditions when multiple bids are placed simultaneously
2. **Configurable Bid Increment Tiers**: Implements a tiered system where minimum bid increments vary based on price levels

---

## Features

### 1. Atomic Bid Validation via Postgres RPC

#### Problem Solved
Without atomic validation, two bidders could theoretically place bids simultaneously at the same price level, creating race conditions and data integrity issues.

#### Solution
A Postgres stored procedure (`validate_and_place_bid`) that:
- Locks the auction row during validation (pessimistic locking)
- Checks auction status and expiration atomically
- Validates bid increment requirements
- Inserts the bid only if all validations pass
- Returns bid details and current auction state

#### How It Works

**Server-side (Postgres):**
```sql
-- Validates and atomically places a bid in a transaction
SELECT * FROM validate_and_place_bid(
  p_auction_id := 1,
  p_bidder_address := '0x123...',
  p_bid_amount := 0.0021,
  p_amount_usd := 6.27,
  p_encrypted := true
);
```

Returns:
```json
{
  "success": true,
  "bid_id": 42,
  "highest_bid": 0.0021,
  "bid_count": 2,
  "minimum_required": 0.002,
  "error": null
}
```

**Client-side flow:**
1. User signs bid with EIP-712
2. Client sends to `/api/bids` POST
3. Server verifies signature
4. Server calls `validate_and_place_bid` RPC
5. If RPC returns success, bid is guaranteed placed atomically
6. Server fetches and returns the bid record

#### Benefits
- ✅ No race conditions - only one bid wins at any price level
- ✅ Atomic insert - bid is placed or rejected, never partial
- ✅ Transaction isolation - database locks prevent concurrent updates
- ✅ Server-side enforcement - client-side code cannot bypass

---

### 2. Configurable Bid Increment Tiers

#### Problem Solved
Without increment rules, bidding could become fragmented (e.g., bids of 0.001 ETH apart), creating poor UX and data bloat.

#### Solution
A tiered increment system where the minimum required increase varies by price level:

| Price Range | Absolute Increment | Percentage Increment | Used For |
|------------|-------------------|---------------------|----------|
| < 0.1 ETH  | 0.0001 ETH        | N/A                 | Absolute |
| 0.1 - 1 ETH| 0.001 ETH         | 1%                  | Max of both |
| 1 - 10 ETH | 0.01 ETH          | 0.5%                | Max of both |
| > 10 ETH   | 0.1 ETH           | 0.25%               | Max of both |

#### Configuration

**File:** `src/lib/bidConfig.ts`

```typescript
export const BID_INCREMENT_TIERS: BidIncrementTier[] = [
  { minAmount: 0, increment: 0.0001 },
  { minAmount: 0.1, increment: 0.001, incrementPercent: 1 },
  { minAmount: 1, increment: 0.01, incrementPercent: 0.5 },
  { minAmount: 10, increment: 0.1, incrementPercent: 0.25 },
];
```

Modify these values to adjust the increment rules for your auction system.

#### Client-Side Usage

```typescript
import {
  getMinimumNextBid,
  validateBidIncrement,
  formatBidIncrementInfo,
} from '@/lib/bidConfig';

// Get minimum valid next bid
const currentBid = 0.005;
const nextMinBid = getMinimumNextBid(currentBid); // 0.0051 ETH

// Validate a user's proposed bid
const userBid = 0.006;
const validation = validateBidIncrement(userBid, currentBid);
if (!validation.valid) {
  console.log(validation.message);
  // "Bid must be at least 0.0051 ETH..."
}

// Format info for display
const info = formatBidIncrementInfo(currentBid);
// "Next minimum bid: 0.0051 ETH (0.0001 ETH above current)"
```

#### Server-Side Enforcement

The Postgres RPC function `validate_and_place_bid` implements the same tiering logic:

```sql
IF v_current_highest < 0.1 THEN
  v_minimum_required := v_current_highest + 0.0001;
ELSIF v_current_highest < 1 THEN
  v_minimum_required := v_current_highest + GREATEST(0.001, v_current_highest * 0.01);
-- ... etc
```

This ensures:
- ✅ Client and server use identical logic (defense in depth)
- ✅ Server rejects bids that don't meet tier requirements
- ✅ Consistent user experience across all scenarios

---

## Implementation Details

### Files Modified

1. **`src/lib/bidConfig.ts`** (NEW)
   - Tiered increment configuration
   - Validation and formatting utilities

2. **`src/app/api/bids/route.ts`** (UPDATED)
   - Removed direct insert
   - Now calls `validate_and_place_bid` RPC
   - Enhanced error reporting with RPC details

3. **`src/app/auctions/page.tsx`** (UPDATED)
   - Imports bid config utilities
   - Client-side validation before signing
   - Enhanced error messages with minimum requirements

4. **`BID_VALIDATION_RPC.sql`** (NEW)
   - Three Postgres functions:
     - `validate_and_place_bid()` - Main atomic bid placement
     - `get_auction_highest_bid()` - Fetch current bid state
     - `validate_bid_against_auction()` - Read-only validation

### Data Flow

```
User enters bid amount
         ↓
Client validation (bidConfig.ts)
         ↓
If valid: Sign with EIP-712 → POST /api/bids
         ↓
Server: Verify signature
         ↓
Server: Call validate_and_place_bid RPC
         ↓
Postgres: Lock auction row
         ↓
Postgres: Check status, expiration, increment
         ↓
If valid: Insert bid atomically
         ↓
Return success with bid ID
         ↓
Client: Show success toast
```

---

## Setup Instructions

### 1. Deploy the Postgres RPC Functions

1. Open Supabase dashboard → SQL Editor
2. Copy the entire contents of `BID_VALIDATION_RPC.sql`
3. Paste into the SQL editor
4. Click "Run"
5. Verify all three functions are created (check in Functions tab)

### 2. Verify RPC Permissions

Check that the authenticated user can call the RPC:

```sql
SELECT * FROM validate_bid_against_auction(1, 0.005);
```

Should return a result set with bid validation info.

### 3. Test in UI

1. Navigate to `/auctions`
2. Open auction card → "Place Encrypted Bid"
3. Try entering a bid below the minimum:
   - Should see toast: `"Bid must be at least X ETH..."`
4. Try entering a valid bid:
   - Should be signed and submitted
   - Server validates atomically
   - Success or failure message shown

---

## Error Handling

### Client-Side Validation

User sees immediate feedback before signing:

```
"Bid must be at least 0.0051 ETH. 
 Next minimum bid: 0.0051 ETH (0.0001 ETH above current)"
```

### Server-Side Validation (RPC)

If client-side check passes but server-side fails (race condition or tampering):

```json
{
  "error": "Bid amount must be greater than 0.0022 ETH (current minimum with increment)",
  "currentHighest": 0.0021,
  "minimumRequired": 0.0022,
  "bidCount": 5
}
```

Toast shows:
```
"Bid rejected: Bid amount must be greater than 0.0022 ETH...
 Current highest: 0.002100 ETH
 Minimum required: 0.002200 ETH"
```

---

## Performance Considerations

### Read-Only Bid State Queries

Use `get_auction_highest_bid()` for fast, non-critical queries:

```typescript
import { getAuctionBidState } from '@/lib/bidValidation';

const state = await getAuctionBidState(auctionId);
console.log(`Current highest: ${state.highestBid} ETH`);
console.log(`Total bids: ${state.bidCount}`);
console.log(`Leading bidder: ${state.bidderAddress}`);
```

### Atomic Write Operations

The `validate_and_place_bid()` function:
- Acquires an exclusive lock on the auction row
- Holds it for the duration of validation + insert
- Releases immediately after

This is efficient because:
- ✅ Lock is held only ~10-50ms per bid
- ✅ Failed validations release lock quickly
- ✅ No lock held during network I/O

### Optimization Opportunities

If you want to track `current_highest` persistently:

```sql
-- Optional: Add column to auctions table
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS current_highest_bid NUMERIC;

-- After insert in validate_and_place_bid:
UPDATE auctions SET current_highest_bid = p_bid_amount WHERE id = p_auction_id;

-- Creates fast lookup without aggregating bids table
```

---

## Testing

### Unit Tests for Bid Increment

```typescript
import { getMinimumNextBid, validateBidIncrement } from '@/lib/bidConfig';

test('Tier 1: < 0.1 ETH uses 0.0001 increment', () => {
  const current = 0.005;
  const next = getMinimumNextBid(current);
  expect(next).toBe(0.0051);
});

test('Tier 2: 0.1 - 1 ETH uses max(0.001, 1%)', () => {
  const current = 0.2;
  const next = getMinimumNextBid(current);
  // 1% = 0.002, absolute = 0.001, max = 0.002
  expect(next).toBe(0.202);
});

test('Invalid bid rejected', () => {
  const validation = validateBidIncrement(0.2051, 0.2);
  expect(validation.valid).toBe(true); // Just above minimum

  const invalid = validateBidIncrement(0.2001, 0.2);
  expect(invalid.valid).toBe(false);
});
```

### Integration Test for RPC

```bash
# In Supabase SQL editor:
SELECT * FROM validate_and_place_bid(
  1,                                    -- auction_id
  '0xtest_address',                     -- bidder
  0.0021,                               -- bid amount
  6.27,                                 -- usd amount
  true                                  -- encrypted
);
```

Expected: Returns `success: true` or `success: false` with error message.

---

## Troubleshooting

### RPC Function Not Found

**Error:** `function validate_and_place_bid not found`

**Solution:**
1. Verify SQL file was executed: Check Supabase Functions tab
2. Refresh browser to clear cached schema
3. Try calling via SQL editor directly to confirm function exists

### Bid Rejected: "Auction not found"

**Error:** `"Auction not found"`

**Solution:**
1. Verify auction ID is correct
2. Check auction exists in auctions table
3. Verify auction.id matches the one being bid on

### Bid Rejected: "Auction is not active"

**Error:** `"Auction is not active"` or `"Auction has ended"`

**Solution:**
1. Verify auction status = 'active'
2. Verify current time < end_time
3. Check timezone consistency (use UTC)

### Bid Increment Calculation Wrong

**Error:** Bid accepted but should have been rejected

**Solution:**
1. Check `BID_INCREMENT_TIERS` in `bidConfig.ts`
2. Verify Postgres RPC has same tier logic
3. Log the calculated `minimumRequired` to debug
4. Compare client and server calculations

---

## Future Enhancements

1. **Automatic Bid Increment Suggestions**
   - Show "Suggested minimum" on bid input
   - Auto-fill with calculated minimum bid

2. **Bid Proxy / Proxy Bidding**
   - Allow user to set max bid
   - System auto-increments to outbid others

3. **Bid Sniping Protection**
   - Auto-extend auction if bid placed near end
   - Prevent last-second bids from winning unfairly

4. **Auction Analytics**
   - Track bid increment distribution
   - Identify optimal increment tiers

5. **Dynamic Increments**
   - Adjust tier thresholds based on auction velocity
   - Higher velocity → larger increments to prevent spam

---

## References

- **Postgres Stored Procedures**: https://www.postgresql.org/docs/current/sql-createfunction.html
- **Supabase RPC**: https://supabase.com/docs/reference/javascript/rpc
- **Row-Level Locking**: https://www.postgresql.org/docs/current/explicit-locking.html
- **Transaction Isolation**: https://www.postgresql.org/docs/current/transaction-iso.html
