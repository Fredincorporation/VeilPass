# Event Status System Redefinition

## Overview
The event status system has been completely redefined to align with the new business logic where sellers create events that require admin approval before they become available for purchase.

## New Event Status Types

### 1. **Pre-Sale** (Purple Badge #9333EA)
- **Status**: Events created by sellers but **NOT YET approved** by admin
- **Visibility**: Events are visible to customers in a preview-only mode
- **Customer Actions**: 
  - Can view event details
  - Can add to wishlist
  - **CANNOT** purchase tickets
  - Will receive notifications when event status changes to "On Sale"
- **Seller Actions**: Can edit event while waiting for approval
- **Admin Actions**: Required to review and approve event before customers can purchase

### 2. **On Sale** (Green Badge #16A34A)
- **Status**: Events that have been **approved by admin** and are currently active
- **Visibility**: Fully visible and available for customer purchase
- **Customer Actions**:
  - View event details
  - Add to wishlist
  - **CAN** purchase tickets
  - Participate in bidding/auctions
- **Duration**: From admin approval through the event date
- **Replaces**: Previously "Live Auction" (which was too specific)

### 3. **Almost Sold Out** (Red Badge #DC2626)
- **Status**: Events with very limited availability remaining
- **Triggers**: When capacity drops below threshold (e.g., <10% available)
- **Customer Actions**: All actions available, with visual urgency indicator
- **Note**: Can be manually set or automatically triggered based on sales

### 4. **Finished** (Gray Badge)
- **Status**: Completed events - no longer available for purchase
- **Visibility**: Historical record only
- **Customer Actions**: Can view event details and history

## Database Schema Changes

### Event Table Update
```sql
CREATE TABLE events (
  ...
  status TEXT NOT NULL DEFAULT 'Pre-Sale' 
  CHECK (status IN ('Pre-Sale', 'On Sale', 'Almost Sold Out', 'Finished')),
  ...
)
```

**Note**: The constraint needs to be updated in your Supabase database to reflect new status values.

## TypeScript Type Definition

```typescript
status: 'Pre-Sale' | 'On Sale' | 'Almost Sold Out' | 'Finished';
```

**Location**: `src/lib/supabase.ts`

## Files Modified

### Core Type Definition
- **`src/lib/supabase.ts`**
  - Updated `Event` interface status type union

### Frontend Components
- **`src/app/events/page.tsx`**
  - Updated status filter dropdown: 'Live Auction' → 'On Sale'
  - Updated status badge colors: Blue (#3B82F6) → Green (#16A34A) for 'On Sale'
  - Purple remains for Pre-Sale, Red for others

- **`src/app/wishlist/page.tsx`**
  - Updated mock data status from 'Live Auction' to 'On Sale'
  - Updated `getStatusColor()` function to use new badge colors
  - Updated status filter dropdown

- **`src/app/page.tsx`** (Homepage)
  - Updated 3 mock event cards status from 'Live Auction' to 'On Sale'
  - Updated stats label: 'Live Auctions' → 'On Sale Events'

### API & Forms
- **`src/app/seller/create-event/page.tsx`**
  - Already sets new events to 'Pre-Sale' (no change needed - working as designed)
  - Events remain in Pre-Sale until admin approval

## Visual Status Indicators

| Status | Badge Color | Hex | Use Case |
|--------|-------------|-----|----------|
| On Sale | Green | #16A34A | Admin-approved, active events |
| Pre-Sale | Purple | #9333EA | Awaiting admin approval |
| Almost Sold Out | Red | #DC2626 | Low availability warning |
| Finished | Gray | #4B5563 | Past events (read-only) |

## Business Logic Flow

```
1. Seller creates event
   ↓
2. Event defaults to "Pre-Sale" status
   ↓
3. Event visible to customers (preview only)
   ↓
4. Customers can add to wishlist
   ↓
5. Admin reviews and approves event
   ↓
6. Status changes to "On Sale"
   ↓
7. Customers receive notification
   ↓
8. Customers can now purchase tickets
```

## Future Implementation Tasks

### 1. Admin Approval Dashboard
- Add admin interface to view Pre-Sale events
- Button to approve/reject events
- Set approval date/time
- Option to request changes from seller

### 2. Customer Notifications
- Send notification when event changes from Pre-Sale → On Sale
- Include event details and purchase link
- Multi-channel: email, in-app, SMS (if available)

### 3. Seller Event Management
- Show Pre-Sale events with "Awaiting Approval" status
- Allow editing while in Pre-Sale
- Prevent editing after approval
- Display approval timestamp

### 4. Database Migration
- Create migration to rename status values for existing events
- Update database constraint in Supabase
- Add audit log for status changes

### 5. API Endpoints
- POST `/api/admin/events/{id}/approve` - Approve event
- POST `/api/admin/events/{id}/reject` - Reject event
- GET `/api/admin/events?status=Pre-Sale` - View pending approvals

## Verification

✅ Type definitions updated
✅ UI components updated (events page, wishlist, homepage)
✅ Mock data updated
✅ Status badge colors updated
✅ Build compiles without errors
✅ Filter dropdowns updated

## Next Steps

1. **Update Supabase Schema**
   - Modify the CHECK constraint on events table status column
   - Run migration to update existing 'Live Auction' → 'On Sale'

2. **Build Admin Approval System**
   - Create admin page for event review
   - Implement approval/rejection logic
   - Add audit logging

3. **Implement Notifications**
   - Set up notification service
   - Send email/in-app when status changes
   - Link to purchase page

4. **Test End-to-End**
   - Create event (Pre-Sale)
   - Admin approves (On Sale)
   - Customer notified
   - Customer can purchase
