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
    if (status === 'On Sale' && updatedEvent) {
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
