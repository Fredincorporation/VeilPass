# Testing Notifications with Mock Data

## Quick Start

### Step 1: Get Your Wallet Address
Run this query in your Supabase SQL editor to find a valid wallet:

```sql
SELECT wallet_address FROM users LIMIT 1;
```

Copy the wallet address returned.

### Step 2: Prepare Mock Data Script
Open `MOCK_NOTIFICATIONS_DATA.sql` in your workspace and replace all occurrences of `your_wallet_address` with the wallet address from Step 1.

### Step 3: Run the Script
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your VeilPass project
3. Go to SQL Editor
4. Create a new query
5. Copy and paste the entire `MOCK_NOTIFICATIONS_DATA.sql` file
6. Click "Run" to execute

### Step 4: Verify Data
Run this verification query:

```sql
SELECT COUNT(*) as total_notifications FROM notifications WHERE user_address = 'your_wallet_address';
```

Should return: `10`

### Step 5: Test in App
1. Connect your wallet (use the same address) to the VeilPass app
2. Navigate to `/notifications`
3. You should see 10 notifications:
   - 2 unread (recent ones)
   - 8 read (older ones)
4. Test features:
   - Search by title or message
   - Filter by "unread", "read", or "all"
   - Click the eye icon to mark as read/unread
   - Click the trash icon to delete
   - Click "Mark all as read" button

## Mock Data Details

The script creates 10 sample notifications with varied data:

| Title | Type | Read | Time Ago | Purpose |
|-------|------|------|----------|---------|
| Ticket Purchase Confirmed | success | ❌ | 2 hours | Recent unread |
| Auction Ending Soon | alert | ❌ | 5 hours | Recent unread |
| Event Reminder | info | ✅ | 1 day | Test read status |
| Loyalty Points Earned | success | ✅ | 2 days | Different type |
| Action Required | alert | ✅ | 3 days | Alert type |
| New Feature Available | info | ✅ | 4 days | Info type |
| Event Hosted Successfully | success | ✅ | 5 days | Success type |
| Payment Failed | alert | ✅ | 6 days | Alert type |
| Newsletter Update | info | ✅ | 7 days | Old read |
| Refund Processed | success | ✅ | 8 days | Oldest |

## Troubleshooting

### No notifications showing?
1. Check your wallet address is correct:
   ```sql
   SELECT * FROM notifications WHERE user_address = 'your_wallet_address' LIMIT 1;
   ```

2. Verify you're logged in with the correct wallet in the app

3. Check browser console for API errors

### All showing as old timestamps?
The timestamps use relative calculations (`NOW() - INTERVAL`), so they're calculated at insertion time. If you need fresher data, delete and re-insert:

```sql
DELETE FROM notifications WHERE user_address = 'your_wallet_address';
```

Then run the insert statements again from `MOCK_NOTIFICATIONS_DATA.sql`.

### Want different notification types?
You can modify the `type` field to one of:
- `'success'` - Green, for positive actions
- `'alert'` - Amber/Orange, for warnings or time-sensitive items
- `'info'` - Blue, for informational messages

## Cleaning Up

To remove all mock data when done testing:

```sql
DELETE FROM notifications WHERE user_address = 'your_wallet_address';
```

Or delete everything (be careful!):

```sql
DELETE FROM notifications;
```

## API Endpoints Reference

The notifications page uses these endpoints:

- `GET /api/notifications?user=wallet_address` - Fetch notifications
- `PUT /api/notifications/{id}` - Mark as read/unread
- `DELETE /api/notifications/{id}` - Delete notification

## Testing Checklist

- [ ] Mock data inserted successfully (10 rows)
- [ ] Can see notifications on /notifications page
- [ ] Unread count shows "2 unread notifications"
- [ ] Search works (try searching "ticket")
- [ ] Filter by "unread" shows 2 items
- [ ] Filter by "read" shows 8 items
- [ ] Can mark individual notifications as read/unread
- [ ] Can delete notifications
- [ ] Timestamps display correctly (e.g., "2h ago")
- [ ] Toast notifications appear when toggling read status
- [ ] Can mark all as read at once
