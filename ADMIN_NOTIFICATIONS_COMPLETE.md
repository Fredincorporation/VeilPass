# Admin Notifications System - Complete Implementation

## Overview
Comprehensive admin notification system that notifies administrators of all critical platform events in real-time.

## Implemented Notifications

### 1. **Seller Application Notifications**
- **Type**: `seller_application`
- **Trigger**: Customer submits seller registration application
- **Recipients**: All admins
- **Message**: "A new seller application has been submitted. Business: [BusinessName]. Please review at /admin/sellers"
- **API**: `/api/user` (PUT)

### 2. **Seller Approval Notifications**
- **Type**: `seller_approved`
- **Trigger**: Admin approves seller application
- **Recipients**: The applicant
- **Message**: "Congratulations! Your seller application has been approved. You can now create and manage events on VeilPass."
- **API**: `/api/admin/sellers/[sellerId]` (PUT)

### 3. **Seller Rejection Notifications**
- **Type**: `seller_rejected`
- **Trigger**: Admin rejects seller application
- **Recipients**: The applicant
- **Message**: "Your seller application has been rejected. Please review your information and try again."
- **API**: `/api/admin/sellers/[sellerId]` (PUT)

### 4. **KYC Verification Notifications**
- **Type**: `kyc_verified` / `kyc_rejected`
- **Trigger**: Admin verifies or rejects ID document
- **Recipients**: The applicant
- **Messages**:
  - Verified: "Your ID has been verified successfully. The admin will now review your seller application."
  - Rejected: "Your ID verification was rejected. Please submit a clear, valid government ID."
- **API**: `/api/admin/seller-ids` (PUT)

### 5. **Event Submission Notifications**
- **Type**: `event_pending_approval`
- **Trigger**: Seller creates new event
- **Recipients**: All admins
- **Message**: "New event \"[EventTitle]\" has been submitted and is waiting for admin approval. Review at /admin/events"
- **API**: `/api/events` (POST)

### 6. **Event Seller Notification**
- **Type**: `event_submitted`
- **Trigger**: Seller creates new event
- **Recipients**: The seller/organizer
- **Message**: "Your event \"[EventTitle]\" has been submitted and is pending admin approval. You'll be notified once reviewed."
- **API**: `/api/events` (POST)

### 7. **Event Approval Notifications**
- **Type**: `event_approved`
- **Trigger**: Admin approves event to go live
- **Recipients**: The seller/organizer
- **Message**: "Your event \"[EventTitle]\" has been approved and is now live!"
- **API**: `/api/admin/events/[id]` (PUT)

### 8. **Event Rejection Notifications**
- **Type**: `event_rejected`
- **Trigger**: Admin rejects event with reason
- **Recipients**: The seller/organizer
- **Message**: "Your event \"[EventTitle]\" has been rejected. Reason: [AdminFeedback]"
- **API**: `/api/admin/events/[id]` (PUT)

### 9. **Ticket Sale Notifications**
- **Type**: `ticket_sold`
- **Trigger**: Customer purchases ticket
- **Recipients**: Event organizer + All admins
- **Messages**:
  - To seller: "A ticket for \"[EventTitle]\" has been purchased by 0x[address]..."
  - To admins: "Ticket sold for event \"[EventTitle]\" at [price] price."
- **API**: `/api/tickets` (POST)

### 10. **Dispute Resolution Notifications**
- **Type**: `dispute_resolved` / `dispute_rejected`
- **Trigger**: Admin resolves or rejects dispute
- **Recipients**: All admins + Claimant + Seller/Defendant
- **Messages**:
  - To admins: "Dispute #[id] has been [resolved/rejected]. Claimant and seller have been notified."
  - To claimant: "Your dispute #[id] has been [resolved/rejected]."
  - To seller: "A dispute against you (#[id]) has been [resolved/rejected]."
- **API**: `/api/admin/disputes/[id]` (PUT)

### 11. **High-Value Bid Notifications**
- **Type**: `high_value_bid`
- **Trigger**: Bid placed above $1000 threshold
- **Recipients**: All admins
- **Message**: "A high-value bid of [amount] has been placed in auction #[id]"
- **API**: `/api/bids` (POST)

### 12. **Outbid Notifications**
- **Type**: `outbid`
- **Trigger**: Bidder is outbid by another user
- **Recipients**: Previous bidder
- **Message**: "Your bid in auction #[id] has been outbid. New leading bid: [amount]"
- **API**: `/api/bids` (POST)

## Frontend Components

### Admin Notifications Bell (`src/components/AdminNotificationsBell.tsx`)
- Beautiful dropdown notification center in admin header
- Shows unread notification count with badge
- Color-coded by notification type
- Displays notification details and timestamps
- "Mark All as Read" button
- Click individual notifications to mark as read
- Categorized emojis for different notification types

### Admin Notifications Hook (`src/hooks/useAdminNotifications.ts`)
- `useAdminNotifications()` - Fetch admin notifications
- `useAdminUnreadNotifications()` - Get only unread notifications
- `useMarkAdminNotificationsAsRead()` - Mark as read
- `useDeleteAdminNotification()` - Delete notifications

### Header Integration
- Updated `src/components/Header.tsx` to detect admin role
- Shows admin notification bell for admin users
- Regular users see standard notification link
- Automatically fetches user role from database

## API Endpoints

### Get Admin Notifications
```
GET /api/admin/notifications?admin_wallet=[wallet]&unread_only=true
```

### Mark Admin Notifications as Read
```
PUT /api/admin/notifications
Body: {
  notification_ids: [1, 2, 3],
  read: true
}
```

## Database Tables

All notifications are stored in the `notifications` table:
```sql
CREATE TABLE notifications (
  id BIGINT PRIMARY KEY,
  user_address TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Notification Types Summary

| Type | Recipient | Importance |
|------|-----------|-----------|
| seller_application | Admins | High |
| seller_approved | Applicant | High |
| seller_rejected | Applicant | Medium |
| kyc_verified | Applicant | High |
| kyc_rejected | Applicant | Medium |
| event_pending_approval | Admins | High |
| event_submitted | Seller | Medium |
| event_approved | Seller | High |
| event_rejected | Seller | Medium |
| ticket_sold | Seller + Admins | Medium |
| dispute_resolved | Admins + Parties | High |
| dispute_rejected | Admins + Parties | High |
| high_value_bid | Admins | Medium |
| outbid | Previous Bidder | Medium |

## Real-Time Updates

- Notifications are created immediately upon action
- Admin notification bell updates every 30 seconds automatically
- Unread count badge updates in real-time
- Notification dropdown shows latest first
- All timestamps are ISO format with local formatting

## Features

✅ Real-time notifications for all critical events
✅ Type-specific icons and color coding
✅ Mark individual or all notifications as read
✅ Persistent notification history
✅ Separate admin and user notification streams
✅ Non-blocking notification creation (API doesn't fail if notification fails)
✅ User-friendly notification bell with badge counter
✅ Detailed message context for each notification
✅ Automatic timestamp formatting
✅ Responsive design for mobile and desktop

## Testing Checklist

- [ ] Seller applies → All admins get notification
- [ ] Admin approves seller → Seller gets approval notification
- [ ] Admin rejects seller → Seller gets rejection notification
- [ ] Admin verifies ID → Seller gets KYC verified notification
- [ ] Admin rejects ID → Seller gets KYC rejected notification
- [ ] Seller creates event → All admins get pending approval notification
- [ ] Seller creates event → Seller gets submitted notification
- [ ] Admin approves event → Seller gets approval notification
- [ ] Admin rejects event → Seller gets rejection with reason
- [ ] Customer buys ticket → Seller + all admins get notification
- [ ] Admin resolves dispute → All parties get notification
- [ ] High-value bid placed → All admins get notification
- [ ] User is outbid → Previous bidder gets notification
- [ ] Click notification → Marked as read
- [ ] Click "Mark All as Read" → All unread marked as read
- [ ] Notification bell badge → Shows unread count correctly
