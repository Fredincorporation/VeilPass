# Event Rejection Workflow - Code Changes Reference

## 1. Database Migration

**File**: `ADD_REJECTION_FIELDS.sql` (NEW FILE)

```sql
-- Add rejection tracking fields to events table
ALTER TABLE events ADD COLUMN rejection_reason TEXT;
ALTER TABLE events ADD COLUMN rejected_at TIMESTAMP;

-- Update status constraint to include 'Rejected' status
ALTER TABLE events DROP CONSTRAINT events_status_check;
ALTER TABLE events ADD CONSTRAINT events_status_check 
  CHECK (status IN ('Pre-Sale', 'Live Auction', 'Almost Sold Out', 'Finished', 'Rejected'));

-- Create index on rejection_reason for faster queries
CREATE INDEX idx_events_rejection_reason ON events(rejection_reason);
```

**Execute in Supabase SQL Editor**

---

## 2. Admin Events Page

**File**: `src/app/admin/events/page.tsx`

### Changes Made:

#### a) Import Addition
```tsx
import { Calendar, MapPin, CheckCircle, XCircle, Loader, X } from 'lucide-react';
```

#### b) New State
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

#### c) Updated handleRejectEvent Function
```typescript
const handleRejectEvent = async (eventId: number, eventTitle: string) => {
  // Open modal for rejection reason
  setRejectionModal({
    isOpen: true,
    eventId,
    eventTitle,
    reason: '',
  });
};
```

#### d) New handleConfirmRejection Function
```typescript
const handleConfirmRejection = async () => {
  if (!rejectionModal.eventId || !rejectionModal.reason.trim()) {
    setMessage({ type: 'error', text: 'Please provide a rejection reason' });
    return;
  }

  setRejectingId(rejectionModal.eventId);
  try {
    await axios.put(`/api/admin/events/${rejectionModal.eventId}`, {
      status: 'Rejected',
      rejection_reason: rejectionModal.reason,
    });

    setMessage({
      type: 'success',
      text: `✓ Event "${rejectionModal.eventTitle}" has been rejected.`,
    });

    await queryClient.invalidateQueries({ queryKey: ['events'] });
    setRejectionModal({ isOpen: false, eventId: null, eventTitle: '', reason: '' });

    setTimeout(() => setMessage(null), 3000);
  } catch (error) {
    setMessage({ type: 'error', text: 'Failed to reject event' });
    console.error('Error rejecting event:', error);
  } finally {
    setRejectingId(null);
  }
};
```

#### e) Modal JSX (Add before closing tags)
```tsx
{/* Rejection Modal */}
{rejectionModal.isOpen && (
  <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reject Event</h2>
        </div>
        <button
          onClick={() => setRejectionModal({ isOpen: false, eventId: null, eventTitle: '', reason: '' })}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Event: <span className="font-semibold text-gray-900 dark:text-white">{rejectionModal.eventTitle}</span>
        </p>

        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Reason for Rejection *
        </label>
        <textarea
          value={rejectionModal.reason}
          onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
          placeholder="Enter the reason for rejecting this event..."
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-red-500 dark:focus:border-red-400 focus:outline-none dark:bg-gray-800 dark:text-white resize-none"
          rows={4}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This reason will be sent to the seller.</p>
      </div>

      <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setRejectionModal({ isOpen: false, eventId: null, eventTitle: '', reason: '' })}
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmRejection}
          disabled={rejectingId !== null || !rejectionModal.reason.trim()}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {rejectingId !== null ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Rejecting...
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              Confirm Rejection
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
```

---

## 3. Admin Events API Endpoint

**File**: `src/app/api/admin/events/[id]/route.ts`

### Complete Updated File:

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id);
    const { status, rejection_reason } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Prepare update object
    const updateData: any = { status };
    
    // If rejecting, add rejection reason and timestamp
    if (status === 'Rejected') {
      updateData.rejection_reason = rejection_reason || 'No reason provided';
      updateData.rejected_at = new Date().toISOString();
    }

    // Update event status
    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select();

    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json(
        { error: `Failed to update event: ${error.message}` },
        { status: 500 }
      );
    }

    const updatedEvent = data?.[0];

    // If event was rejected, create notification for the organizer
    if (status === 'Rejected' && updatedEvent) {
      try {
        await supabase
          .from('notifications')
          .insert({
            user_address: updatedEvent.organizer,
            type: 'event_rejected',
            title: 'Event Rejected',
            message: `Your event "${updatedEvent.title}" has been rejected. Reason: ${rejection_reason}`,
          });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the request if notification fails
      }
    }

    // If event was approved, create notification for the organizer
    if (status === 'Live Auction' && updatedEvent) {
      try {
        await supabase
          .from('notifications')
          .insert({
            user_address: updatedEvent.organizer,
            type: 'event_approved',
            title: 'Event Approved',
            message: `Your event "${updatedEvent.title}" has been approved and is now live!`,
          });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Event status updated to ${status}`,
      event: updatedEvent,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Error in event update:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
```

---

## 4. Seller Events Page

**File**: `src/app/seller/events/page.tsx`

### Changes Made:

#### a) Import Addition
```typescript
import { Calendar, MapPin, Users, TrendingUp, Search, Filter, Plus, Edit, Eye, MoreVertical, Clock, Zap, AlertCircle, X } from 'lucide-react';
```

#### b) New State
```typescript
const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming' | 'ended' | 'rejected'>('all');
const [selectedRejection, setSelectedRejection] = useState<{ title: string; reason: string } | null>(null);
```

#### c) Updated getStatusColor Function
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pre-Sale':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800';
    case 'Live Auction':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800';
    case 'active':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800';
    case 'upcoming':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800';
    case 'ended':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700';
    case 'Rejected':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800';
    default:
      return 'bg-gray-100 dark:bg-gray-800';
  }
};
```

#### d) Add Rejected Filter Button
```tsx
<button
  onClick={() => setFilterStatus('rejected')}
  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
    filterStatus === 'rejected'
      ? 'bg-red-500 text-white'
      : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
  }`}
>
  Rejected
</button>
```

#### e) Updated Status Badge
```tsx
{/* Status Badge */}
<div className="absolute top-3 right-3">
  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border-2 cursor-pointer hover:scale-110 transition-transform ${getStatusColor(event.status)}`}
        onClick={() => event.status === 'Rejected' && event.rejection_reason ? setSelectedRejection({ title: event.title, reason: event.rejection_reason }) : null}>
    {event.status === 'active' && <Zap className="w-3 h-3 inline mr-1" />}
    {event.status === 'Rejected' && <AlertCircle className="w-3 h-3 inline mr-1" />}
    {event.status === 'Pre-Sale' && '⏳'}
    {event.status === 'Live Auction' && '🎉'}
    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
  </span>
</div>
```

#### f) Updated Action Buttons (Hide for Rejected)
```tsx
{/* Actions */}
{event.status !== 'ended' && event.status !== 'Rejected' && (
  <div className="flex gap-2">
    <button 
      onClick={() => handleEditEvent(event.id, event.title)}
      className="flex-1 px-3 py-2 rounded-lg border-2 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition text-sm flex items-center justify-center gap-2">
      <Edit className="w-4 h-4" />
      Edit
    </button>
    <button 
      onClick={() => handleViewEvent(event.id, event.title)}
      className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold transition text-sm flex items-center justify-center gap-2">
      <Eye className="w-4 h-4" />
      View
    </button>
  </div>
)}

{/* Rejected Event Info */}
{event.status === 'Rejected' && (
  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">Event Rejected</p>
        <p className="text-xs text-red-700 dark:text-red-300">{event.rejection_reason || 'No reason provided'}</p>
      </div>
    </div>
  </div>
)}
```

#### g) Add Rejection Reason Modal
```tsx
{/* Rejection Reason Modal */}
{selectedRejection && (
  <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rejection Reason</h2>
        </div>
        <button
          onClick={() => setSelectedRejection(null)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Event: <span className="font-semibold text-gray-900 dark:text-white">{selectedRejection.title}</span>
        </p>

        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-900 dark:text-red-200 whitespace-pre-wrap">
            {selectedRejection.reason}
          </p>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          You can resubmit this event for approval after addressing the issues mentioned above.
        </p>
      </div>

      <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setSelectedRejection(null)}
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
```

---

## Summary of Changes

| Component | Type | Lines | Status |
|-----------|------|-------|--------|
| Database Migration | NEW | ~10 | ✅ Created |
| Admin Page | UPDATE | +130 | ✅ Modified |
| Admin API | UPDATE | +50 | ✅ Modified |
| Seller Page | UPDATE | +80 | ✅ Modified |

**Total LOC Added**: ~270 lines
**Total Files Modified**: 4
**New Files**: 2 (migration + documentation)

---

## Testing Checklist

- [ ] Run SQL migration: `ADD_REJECTION_FIELDS.sql`
- [ ] Admin can click Reject and see modal
- [ ] Admin must enter reason (validation works)
- [ ] Admin can submit rejection with reason
- [ ] Event status changes to "Rejected" in DB
- [ ] rejection_reason is saved correctly
- [ ] rejected_at timestamp is recorded
- [ ] Seller receives "event_rejected" notification
- [ ] Seller sees red "Rejected" badge on event card
- [ ] Clicking rejected badge opens reason modal
- [ ] Rejection reason displays correctly with text wrapping
- [ ] "Rejected" filter works on seller dashboard
- [ ] Edit/View buttons hidden for rejected events
- [ ] Dark mode works correctly
- [ ] Mobile responsive on all screen sizes
