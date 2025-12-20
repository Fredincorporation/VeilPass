# Fix Organizer Addresses in Events

## Problem
Events were created with business names (like 'Jogn') in the `organizer` field instead of wallet addresses (0x...). This prevents wallet payment prompts because the code validates that `organizer` is a valid Ethereum address.

## Solution Implemented
✅ **Fixed in code:** `src/app/seller/create-event/page.tsx` now always uses the wallet `account` (Ethereum address) instead of `businessName`.

**New events will automatically use the correct wallet address.**

## Fix Existing Events in Database
You need to update existing events that have invalid organizer addresses. Use one of these approaches:

### Option 1: If You Know Your Wallet Address
Replace `YOUR_WALLET_ADDRESS` with your actual Ethereum address (0x...) and run:

```sql
UPDATE events 
SET organizer = 'YOUR_WALLET_ADDRESS'
WHERE organizer IS NOT NULL 
  AND organizer != ''
  AND (organizer NOT LIKE '0x%' OR LENGTH(organizer) != 42);
```

### Option 2: For Specific Event IDs
If you know the event IDs that need fixing:

```sql
UPDATE events 
SET organizer = 'YOUR_WALLET_ADDRESS'
WHERE id IN (1, 2, 3);  -- Replace with your event IDs
```

### Option 3: View Current Events to Identify Issues
```sql
SELECT id, title, organizer 
FROM events 
WHERE organizer IS NOT NULL 
  AND organizer != ''
  AND (organizer NOT LIKE '0x%' OR LENGTH(organizer) != 42)
ORDER BY created_at DESC;
```

## How to Update

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to SQL Editor
   - Paste the appropriate SQL query above
   - Click "Run"

2. **Verify the Fix**
   ```sql
   SELECT id, title, organizer FROM events WHERE id = YOUR_EVENT_ID;
   ```
   The `organizer` should now be in format: `0x` followed by 40 hexadecimal characters.

3. **Test Payment Flow**
   - Open the event detail page
   - Click "Get Tickets"
   - Select quantity/tier
   - Click "Pay Now"
   - The wallet should now prompt for payment approval

## Verification
After updating, test that:
1. ✅ Event loads without errors
2. ✅ Organizer address shows as valid 0x address
3. ✅ Clicking "Pay Now" triggers wallet prompt
4. ✅ Wallet shows payment request
5. ✅ After approval, tickets appear on /tickets page
6. ✅ QR codes generate correctly

## For Production
After verifying one event works, you can bulk update all invalid organizer addresses using Option 1 above.
