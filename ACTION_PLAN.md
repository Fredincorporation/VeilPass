# VeilPass - Supabase Integration Action Plan

## ✅ What's Done (No Action Needed)

All code has been written and integrated:
- ✅ Supabase client initialized
- ✅ API routes created (5 routes)
- ✅ React Query hooks created (6 hooks)
- ✅ Events page updated to use real data
- ✅ Dashboard updated for wallet authentication
- ✅ Full TypeScript support
- ✅ Error handling implemented

## 📋 What You Need to Do (Action Required)

### Phase 1: Database Setup (Do This First)
**Time: ~10 minutes**

Go to: https://app.supabase.com

**Step 1:** Open SQL Editor
- Click "New Query" in the SQL Editor

**Step 2:** Run the 6 SQL queries
- Copy from `SUPABASE_SETUP.md`
- Paste each query and click "Run"
- Verify each table is created

**Order to run:**
1. Users Table (creates users table)
2. Events Table (creates events table)
3. Tickets Table (creates tickets table with FK to events)
4. Auctions Table (creates auctions table with FK to tickets)
5. Bids Table (creates bids table with FK to auctions)
6. Broadcasts Table (for admin messages)

**Step 3:** Verify tables created
- Go to Table Editor
- You should see: users, events, tickets, auctions, bids, broadcasts

### Phase 2: Add Sample Data (Do This Second)
**Time: ~5 minutes**

**Option A: Use SQL (Recommended)**
1. Go to SQL Editor
2. Copy the INSERT query from `SUPABASE_SETUP.md`
3. Run it to add 3 sample events

**Option B: Use Table Editor**
1. Go to Table Editor → events
2. Click "Insert" 
3. Fill in fields manually:
   - title: "Summer Music Fest"
   - date: "Jun 15-17, 2025"
   - location: "Central Park, New York"
   - base_price: 0.25
   - capacity: "5,250 / 10,000"
   - status: "Pre-Sale"
   - organizer: "Festival Productions Inc."
   - image: (any image URL)

### Phase 3: Test the Connection (Do This Third)
**Time: ~5 minutes**

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to events page:**
   - Open http://localhost:3000/events
   - You should see the sample events loading
   - Check browser console for errors

3. **Verify data is loading:**
   - If no events show, check:
     - Console for error messages
     - Supabase credentials in `.env.local`
     - Tables exist in Supabase dashboard
     - Sample events were inserted

### Phase 4: Test Wallet Authentication (Do This Fourth)
**Time: ~5 minutes**

1. **Connect wallet:**
   - Click "Connect Wallet" on the site
   - Approve connection in wallet extension

2. **Verify user created:**
   - Go to Supabase → Table Editor
   - Open "users" table
   - You should see a new row with:
     - wallet_address: (your wallet address)
     - role: "customer"
     - loyalty_points: 0

3. **Verify dashboard loads:**
   - Navigate to /dashboard
   - You should see your user data
   - No errors in console

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module '@/hooks/useEvents'"
**Solution:** Make sure the hooks files exist in `src/hooks/`:
- useEvents.ts
- useTickets.ts
- useAuctions.ts
- useBids.ts
- useUser.ts
- useWalletAuthentication.ts

### Issue: Events page shows "Error loading events"
**Solution:** Check these in order:
1. `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Tables exist in Supabase (`users`, `events`, `tickets`, etc.)
3. Sample data was inserted into `events` table
4. Browser console shows the actual error message
5. Network tab shows `/api/events` request and response

### Issue: "PGRST116" error when connecting wallet
**Solution:** This is normal! It means the user doesn't exist yet
- The system will auto-create the user
- This should happen automatically, but you can verify:
  1. Check Supabase users table
  2. A new row should appear with your wallet address

### Issue: User not appearing in users table after wallet connect
**Solution:** 
1. Make sure wallet actually connected (check header)
2. Check browser console for errors in useWalletAuthentication
3. Try refreshing the dashboard page
4. Check that `/api/user` endpoint is working in Network tab

### Issue: Build fails with TypeScript errors
**Solution:** 
1. Run `npm run type-check` to see all errors
2. Most common: Missing types in `.env.local` or interfaces
3. Check `src/lib/supabase.ts` for interface definitions
4. Make sure all hook imports are correct

## 📱 Testing Features

Once Phase 4 is complete, you can test:

### Test 1: Event Listing
- [ ] Navigate to `/events`
- [ ] Events should load from database
- [ ] Search should work
- [ ] Filtering by status should work
- [ ] Click on event should navigate to detail page

### Test 2: User Authentication
- [ ] Connect wallet
- [ ] User created in Supabase
- [ ] Dashboard loads with user data
- [ ] Disconnect wallet
- [ ] User record persists in database

### Test 3: Loyalty Points (When Purchase is Implemented)
- [ ] Purchase ticket
- [ ] Loyalty points updated in Supabase
- [ ] Dashboard shows new loyalty points

### Test 4: Ticket Management (When Form is Complete)
- [ ] List ticket for auction
- [ ] Ticket appears in auctions
- [ ] Can place bid on auction

## 🔗 Important Links

| Resource | Link |
|----------|------|
| Supabase Dashboard | https://app.supabase.com |
| Your Project | Look for "veilpass" in project list |
| SQL Editor | Supabase → SQL Editor |
| Table Editor | Supabase → Table Editor |
| API Docs | SUPABASE_SETUP.md in project root |
| Hook Reference | HOOKS_REFERENCE.md in project root |

## ✨ Success Checklist

- [ ] All 6 database tables created in Supabase
- [ ] Sample events inserted into events table
- [ ] `npm run dev` starts without errors
- [ ] Events page loads and displays data from Supabase
- [ ] Wallet connects successfully
- [ ] New user appears in Supabase users table
- [ ] Dashboard loads with user data
- [ ] No errors in browser console

Once all checkmarks are done, you're ready to:
- Add more features to other pages
- Implement ticket purchasing
- Implement auction bidding
- Add admin features
- Deploy to production

## 🎯 Next Features to Implement

After this integration is complete, consider:

1. **Tickets Page Update**
   - Use `useTickets()` hook
   - Show user's purchased tickets
   - Allow listing for auction

2. **Auctions Page Update**
   - Use `useAuctions()` hook
   - Show active auctions
   - Use `usePlaceBid()` to place bids

3. **Event Detail Page**
   - Fetch specific event
   - Create ticket purchase form
   - Show available seats
   - Calculate loyalty points

4. **User Settings Page**
   - Use `useUser()` and `useUpdateUser()`
   - Allow updating profile
   - Show loyalty points balance
   - Show transaction history

5. **Admin Pages**
   - Broadcast messages (already partially done)
   - User management
   - Event management
   - Report generation

## 📞 Need Help?

If you get stuck:

1. **Check the documentation:**
   - `SUPABASE_SETUP.md` - Setup instructions
   - `HOOKS_REFERENCE.md` - API reference
   - `INTEGRATION_COMPLETE.md` - Overview

2. **Check the browser console:**
   - Right-click → Inspect → Console tab
   - Error messages usually explain the issue
   - Network tab shows API requests/responses

3. **Check Supabase dashboard:**
   - Verify tables exist
   - Check data in tables
   - Look for errors in logs

4. **Common fixes:**
   - Restart dev server: Ctrl+C, then `npm run dev`
   - Clear cache: Delete `.next` folder, restart dev server
   - Check env variables: Verify `.env.local` has correct values

---

**You're all set! Follow Phase 1-4 above to complete the integration.**
