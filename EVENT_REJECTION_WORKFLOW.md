# Event Rejection Workflow Implementation

## Overview
Implemented a complete event rejection workflow that allows admins to reject Pre-Sale events with detailed rejection reasons. Sellers are notified and can see rejection details with the option to resubmit.

## Implementation Details

### 1. Database Changes

**File**: `ADD_REJECTION_FIELDS.sql`

Added three new fields to the events table:
```sql
ALTER TABLE events ADD COLUMN rejection_reason TEXT;
ALTER TABLE events ADD COLUMN rejected_at TIMESTAMP;

-- Updated status constraint to include 'Rejected' status
ALTER TABLE events ADD CONSTRAINT events_status_check 
  CHECK (status IN ('Pre-Sale', 'Live Auction', 'Almost Sold Out', 'Finished', 'Rejected'));
```

**New Columns**:
- `rejection_reason` (TEXT): Stores the admin's reason for rejection
- `rejected_at` (TIMESTAMP): Timestamp of when the event was rejected

**Status Update**:
- Added `'Rejected'` as a valid event status

---

### 2. Admin Event Approval Page Updates

**File**: `src/app/admin/events/page.tsx`

#### New State:
```typescript
const [rejectionModal, setRejectionModal] = useState<{ 
  isOpen: boolean; 
  eventId: number | null; 
  eventTitle: string; 
  reason: string 
}>({
  isOpen: false,
  eventId: null,
  eventTitle: '',
  reason: '',
});
```

#### New Functions:
- `handleRejectEvent()`: Opens rejection modal instead of immediately rejecting
- `handleConfirmRejection()`: Submits rejection with reason to API

#### New Modal:
A professional modal UI that:
- Prompts admin for rejection reason (required field)
- Shows event title for confirmation
- Includes helpful text explaining this reason will be sent to seller
- Has Cancel and Confirm Rejection buttons

**Features**:
- Validation: Reason must be non-empty
- User feedback: Loading state during submission
- Success message: Shows event was rejected
- Cache invalidation: Refreshes event list

---

### 3. Admin API Endpoint Updates

**File**: `src/app/api/admin/events/[id]/route.ts`

#### Enhanced Functionality:
```typescript
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { status, rejection_reason } = await request.json();
  
  const updateData: any = { status };
  
  // If rejecting, add rejection reason and timestamp
  if (status === 'Rejected') {
    updateData.rejection_reason = rejection_reason || 'No reason provided';
    updateData.rejected_at = new Date().toISOString();
  }
  
  // Update event in database
  // Create notification for seller
}
```

#### Automatic Notifications:
The endpoint automatically creates notifications for sellers when:
1. **Event Rejected**: Creates notification with rejection reason
   - Type: `event_rejected`
   - Message includes rejection reason
   
2. **Event Approved**: Creates notification when approved
   - Type: `event_approved`
   - Message confirms event is now live

#### Error Handling:
- Notification failures don't fail the event update
- Errors are logged but event update proceeds

---

### 4. Seller Events Page Updates

**File**: `src/app/seller/events/page.tsx`

#### New Filter Option:
Added `rejected` as a filter status alongside existing filters:
```typescript
<button onClick={() => setFilterStatus('rejected')} ...>
  Rejected
</button>
```

#### Enhanced Status Coloring:
```typescript
const getStatusColor = (status: string) => {
  case 'Rejected':
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800';
  // ... other cases
};
```

#### Status Badges:
- Shows emoji indicators: `⏳` for Pre-Sale, `🎉` for Live Auction, `🚨` for Rejected
- Rejected badge is clickable to view rejection reason

#### Rejection Info Display:
For rejected events, shows a red info box with:
- Alert icon
- "Event Rejected" label
- The admin's rejection reason
- Disables Edit/View buttons for rejected events

#### Modal for Rejection Details:
Clicking a rejected event badge opens a modal showing:
- Event title
- Full rejection reason (with text wrapping for long reasons)
- Message: "You can resubmit this event for approval after addressing the issues mentioned above."

---

## User Flow

### Admin Workflow:
1. **Admin** clicks "Reject" button on a Pre-Sale event
2. **Modal appears** asking for rejection reason
3. **Admin** enters detailed reason and clicks "Confirm Rejection"
4. **API processes** request:
   - Updates event status to `'Rejected'`
   - Stores rejection reason and timestamp
   - Creates notification for seller
5. **Confirmation** message appears and event list refreshes
6. **Event removed** from Pre-Sale approval queue

### Seller Workflow:
1. **Seller** sees event status changed to "Rejected" with red badge
2. **Seller** clicks rejection badge or views events page
3. **Modal opens** showing rejection reason
4. **Seller** can:
   - Read the rejection feedback
   - Edit event to address issues
   - Resubmit for approval (if editing is implemented)
5. **Notification** in notifications center with rejection details

---

## Database Schema

### Updated Events Table:
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
  status TEXT NOT NULL DEFAULT 'Pre-Sale' 
    CHECK (status IN ('Pre-Sale', 'Live Auction', 'Almost Sold Out', 'Finished', 'Rejected')),
  organizer TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rejection_reason TEXT,          -- NEW
  rejected_at TIMESTAMP           -- NEW
);
```

---

## Notifications Integration

### Rejection Notification:
```typescript
{
  user_address: event.organizer,
  type: 'event_rejected',
  title: 'Event Rejected',
  message: `Your event "Event Title" has been rejected. Reason: [Admin's reason]`
}
```

### Approval Notification:
```typescript
{
  user_address: event.organizer,
  type: 'event_approved',
  title: 'Event Approved',
  message: `Your event "Event Title" has been approved and is now live!`
}
```

---

## UI Components

### Admin Rejection Modal:
- **Title**: "Reject Event" with alert icon
- **Input**: Textarea for rejection reason (4 rows)
- **Buttons**: Cancel, Confirm Rejection (with loading state)
- **Styling**: Red accent with dark mode support
- **Validation**: Reason is required

### Seller Rejection Display:
- **Badge**: Red with alert icon and "Rejected" label
- **Info Box**: Shows rejection reason with alert styling
- **Modal**: Full-screen overlay for detailed reason viewing
- **Action**: Can dismiss and view other event details

---

## Testing Checklist

- [ ] Admin can click Reject button and see modal
- [ ] Admin must enter reason (validation works)
- [ ] Admin can submit rejection
- [ ] Event status changes to "Rejected" in database
- [ ] Seller receives notification about rejection
- [ ] Seller sees rejected event in their events list
- [ ] Seller can filter by "Rejected" status
- [ ] Seller can click rejection badge to view reason
- [ ] Rejection reason displays correctly in modal
- [ ] Edit/View buttons hidden for rejected events
- [ ] Dark mode styling works correctly
- [ ] Mobile responsive design works

---

## Future Enhancements

1. **Resubmit for Approval**: Allow sellers to edit and resubmit rejected events
2. **Rejection History**: Keep audit trail of all rejection attempts
3. **Email Notifications**: Send email to seller about rejection
4. **Appeal Process**: Allow sellers to appeal rejections
5. **Batch Operations**: Reject multiple events at once
6. **Rejection Templates**: Pre-defined rejection reasons for consistency
7. **Statistics**: Track rejection rates and common reasons

---

## Files Modified

1. **CREATE**: `ADD_REJECTION_FIELDS.sql` - Database migration
2. **UPDATE**: `src/app/admin/events/page.tsx` - Added rejection modal
3. **UPDATE**: `src/app/api/admin/events/[id]/route.ts` - Enhanced with rejection handling
4. **UPDATE**: `src/app/seller/events/page.tsx` - Added rejection display and filter

---

## Status
✅ **COMPLETE** - Event rejection workflow fully implemented and ready for testing
