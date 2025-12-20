# Admin Notifications - Complete Workflow Guide

## System Overview

The VeilPass admin notification system provides real-time alerts to all administrators about critical platform events, user actions, and system activities.

## User Flow

### Admin User Story: Monitoring Platform Activity

#### 1. Admin Logs In
```
👤 Admin connects wallet
  ↓
🔐 System detects role = 'admin'
  ↓
📱 Header displays Admin Notification Bell
   (instead of standard notification link)
  ↓
🔔 Bell auto-refreshes every 30 seconds
```

#### 2. Admin Opens Notification Bell
```
🔔 Click bell icon
  ↓
📋 Dropdown opens showing:
   - Unread notification count (red badge)
   - List of latest notifications
   - Color-coded by type
   - Timestamps
  ↓
👁️ View notification details
```

#### 3. Admin Takes Action
```
🔔 Click individual notification
  ↓
✓ Marked as read automatically
  ↓
OR
  ↓
📌 Click "Mark All as Read"
   ↓
   ✓ All unread marked as read
```

## Notification Events & Flows

### 1. Seller Application Flow

```
┌─────────────────────────────────────────────────┐
│ CUSTOMER APPLIES TO BE SELLER                   │
└─────────────────────────────────────────────────┘
           ↓
    POST /api/user (with role: 'awaiting_seller')
           ↓
┌─────────────────────────────────────────────────┐
│ ADMIN NOTIFICATION CREATED                      │
│ Type: seller_application                        │
│ Recipients: ALL ADMINS                          │
│ Message: "A new seller application has been     │
│          submitted. Business: [name]..."        │
│ Action: /admin/sellers                          │
└─────────────────────────────────────────────────┘
           ↓
    📧 All admins receive notification
           ↓
    👨‍💼 Admin reviews at /admin/sellers
           ↓
           ├─ APPROVE
           │    ↓
           │  PUT /api/admin/sellers/[id]
           │    ↓
           │  ✅ SELLER APPROVAL NOTIFICATION
           │     Type: seller_approved
           │     Recipient: Applicant
           │     Message: "Congratulations! 
           │              Your application approved..."
           │
           └─ REJECT
                ↓
              PUT /api/admin/sellers/[id]
                ↓
              ❌ SELLER REJECTION NOTIFICATION
                 Type: seller_rejected
                 Recipient: Applicant
                 Message: "Your application rejected..."
```

### 2. Event Approval Flow

```
┌─────────────────────────────────────────────────┐
│ SELLER CREATES NEW EVENT                        │
└─────────────────────────────────────────────────┘
           ↓
    POST /api/events
           ↓
┌─────────────────────────────────────────────────┐
│ TWO NOTIFICATIONS CREATED                       │
├─────────────────────────────────────────────────┤
│ 1. TO ALL ADMINS                                │
│    Type: event_pending_approval                 │
│    Message: "New event submitted. 
│             Review at /admin/events"            │
│                                                 │
│ 2. TO SELLER                                    │
│    Type: event_submitted                        │
│    Message: "Your event submitted for review.  │
│             You'll be notified..."              │
└─────────────────────────────────────────────────┘
           ↓
    👨‍💼 Admin reviews at /admin/events
           ↓
           ├─ APPROVE
           │    ↓
           │  PUT /api/admin/events/[id]
           │  (status: 'On Sale')
           │    ↓
           │  ✅ EVENT APPROVAL NOTIFICATION
           │     Recipient: Seller
           │     Message: "Your event approved 
           │              and is now live!"
           │
           └─ REJECT (with reason)
                ↓
              PUT /api/admin/events/[id]
              (status: 'Rejected', 
               rejection_reason: '...')
                ↓
              ❌ EVENT REJECTION NOTIFICATION
                 Recipient: Seller
                 Message: "Event rejected. 
                          Reason: [admin feedback]"
```

### 3. Ticket Sale Flow

```
┌─────────────────────────────────────────────────┐
│ CUSTOMER PURCHASES TICKET                       │
└─────────────────────────────────────────────────┘
           ↓
    POST /api/tickets
           ↓
┌─────────────────────────────────────────────────┐
│ TWO NOTIFICATIONS CREATED                       │
├─────────────────────────────────────────────────┤
│ 1. TO SELLER/ORGANIZER                          │
│    Type: ticket_sold                            │
│    Message: "A ticket for '[Event]' purchased" │
│                                                 │
│ 2. TO ALL ADMINS                                │
│    Type: ticket_sold                            │
│    Message: "Ticket sold for '[Event]'..."      │
└─────────────────────────────────────────────────┘
```

### 4. Dispute Resolution Flow

```
┌─────────────────────────────────────────────────┐
│ DISPUTE CREATED (automatic)                     │
│ Issue reported by customer                      │
└─────────────────────────────────────────────────┘
           ↓
    📧 Admins can see open disputes
           ↓
    👨‍💼 Admin reviews at /admin/disputes
           ↓
           ├─ RESOLVE (approve refund)
           │    ↓
           │  PUT /api/admin/disputes/[id]
           │  (status: 'RESOLVED')
           │    ↓
           │  ✅ THREE NOTIFICATIONS
           │     1. All Admins: "Resolved"
           │     2. Claimant: "Approved"
           │     3. Seller: "Denied"
           │
           └─ REJECT (deny claim)
                ↓
              PUT /api/admin/disputes/[id]
              (status: 'REJECTED')
                ↓
              ❌ THREE NOTIFICATIONS
                 1. All Admins: "Rejected"
                 2. Claimant: "Denied"
                 3. Seller: "Cleared"
```

### 5. Bid & Auction Flow

```
┌─────────────────────────────────────────────────┐
│ USER PLACES BID                                 │
└─────────────────────────────────────────────────┘
           ↓
    POST /api/bids
           ↓
           ├─ IF BID > $1000
           │    ↓
           │  📊 HIGH-VALUE BID NOTIFICATION
           │     Type: high_value_bid
           │     Recipients: ALL ADMINS
           │     Message: "High-value bid $[amount]"
           │
           └─ IF OUTBID SOMEONE
                ↓
              ❌ OUTBID NOTIFICATION
                 Type: outbid
                 Recipient: Previous Bidder
                 Message: "You've been outbid.
                          New bid: $[amount]"
```

## Notification Center UI

### Bell Icon Location
```
┌─────────────────────────────────────────────────┐
│ VeilPass  Dashboard  Events  Auctions  | 🔔 📝 🌙│
│                                          ↓
│                                    Notifications
│                                    Bell (Red Badge)
└─────────────────────────────────────────────────┘
```

### Notification Dropdown

```
╔═════════════════════════════════════════════════╗
║ Notifications (3)                          [X]  ║
╠═════════════════════════════════════════════════╣
║                                                 ║
║  👤 New Seller Application             [UNREAD]║
║  A new seller applied. Review...        Dec 19 ║
║  ----------------------------------------------- ║
║  🎫 Ticket Sold                          [READ] ║
║  Ticket for Concert 2025 purchased...  Dec 19  ║
║  ----------------------------------------------- ║
║  ⚠️  Dispute Resolved                   [UNREAD]║
║  Dispute #5 has been resolved...        Dec 19 ║
║                                                 ║
╠═════════════════════════════════════════════════╣
║              [Mark All as Read]                 ║
╚═════════════════════════════════════════════════╝
```

### Color Coding

```
Amber (🟨) - Seller Applications, Pending Approvals
Blue  (🟦) - KYC/ID Verification
Red   (🟥) - Rejections, Disputes
Green (🟩) - Approvals, Resolved
```

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────┐
│                USER ACTION                           │
│  (Apply, Create Event, Buy Ticket, etc.)             │
└───────────────────┬──────────────────────────────────┘
                    │
                    ↓
        ┌───────────────────────┐
        │   API ENDPOINT        │
        │ (/api/tickets, etc.)  │
        └───────────┬───────────┘
                    │
                    ↓
        ┌───────────────────────┐
        │  PROCESS ACTION       │
        │  Update Database      │
        └───────────┬───────────┘
                    │
                    ↓
        ┌───────────────────────────────┐
        │  CREATE NOTIFICATION(S)       │
        │  - Get recipient addresses    │
        │  - Insert into DB             │
        │  - Non-blocking (try/catch)   │
        └───────────┬───────────────────┘
                    │
        ┌───────────┴───────────────────┐
        ↓                               ↓
    ✅ ADMIN                        📧 USER
    - Fetches via                  - Views in
      /api/admin/                    dropdown or
      notifications                  /notifications
    - Shows bell badge             - Marks as read
    - Updates every 30s            - Dismisses
```

## Key Files

```
📁 API Endpoints
├── src/app/api/user/route.ts
├── src/app/api/events/route.ts
├── src/app/api/tickets/route.ts
├── src/app/api/bids/route.ts
├── src/app/api/admin/sellers/[sellerId]/route.ts
├── src/app/api/admin/seller-ids/route.ts
├── src/app/api/admin/events/[id]/route.ts
├── src/app/api/admin/disputes/[id]/route.ts
└── src/app/api/admin/notifications/route.ts

📁 Frontend Components
├── src/components/AdminNotificationsBell.tsx
├── src/components/Header.tsx
└── src/hooks/useAdminNotifications.ts

📁 Documentation
├── ADMIN_NOTIFICATIONS_COMPLETE.md
└── ADMIN_NOTIFICATIONS_STATUS.md
```

## Best Practices Implemented

✅ **Non-Blocking Notifications**
- Try/catch blocks prevent notification failures from affecting main request
- Users don't experience delays waiting for notifications

✅ **Efficient Updates**
- Admin bell refreshes every 30 seconds, not per action
- Reduces server load while keeping admins informed

✅ **Type Safety**
- TypeScript interfaces for all notification types
- Proper typing for hooks and components

✅ **Error Handling**
- Console logging for debugging
- Graceful failures with fallbacks
- Never expose errors to users

✅ **Security**
- Admin role check in header
- Only admins see admin notifications
- Wallet address verification

✅ **User Experience**
- Beautiful, intuitive UI
- Color-coded by type
- Clear, actionable messages
- Timestamps with human-readable format

## Troubleshooting

### Notifications Not Appearing?

1. **Check user role**
   - Verify user has `role = 'admin'` in database
   - Refresh page to reload role

2. **Check notification creation**
   - Check server logs for errors
   - Verify notifications table exists
   - Confirm user_address format

3. **Clear cache**
   - Clear browser cache
   - Restart development server
   - Check for stale data

### High Notification Volume?

- Adjust high_value_bid threshold (currently $1000)
- Implement notification grouping
- Add notification categories/filters

## Summary

The admin notification system provides comprehensive, real-time visibility into all platform activities. Admins receive actionable notifications that help them monitor the platform, approve applications, resolve disputes, and ensure system integrity.

**Status**: ✅ COMPLETE AND READY FOR PRODUCTION
