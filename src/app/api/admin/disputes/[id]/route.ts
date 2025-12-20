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
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Dispute ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, resolution } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    console.log(`Updating dispute ${id} to status: ${status}`);

    // Update the dispute status in database
    const { data, error } = await supabase
      .from('disputes')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(id))
      .select();

    if (error) {
      console.error('Error updating dispute:', error);
      return NextResponse.json(
        { error: 'Failed to update dispute', details: error.message },
        { status: 500 }
      );
    }

    console.log(`Successfully updated dispute ${id}:`, data);

    const updatedDispute = data?.[0];

    // Send notifications about dispute resolution
    try {
      const notificationMessage = `Dispute #${id} has been ${status.toLowerCase()}.${resolution ? ` Resolution: ${resolution}` : ''}`;
      
      // Notify all admins
      const { data: admins } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const adminNotifications = admins.map(admin => ({
          user_address: admin.wallet_address,
          type: status === 'RESOLVED' ? 'dispute_resolved' : 'dispute_rejected',
          title: status === 'RESOLVED' ? 'Dispute Resolved' : 'Dispute Rejected',
          message: notificationMessage,
        }));
        await supabase.from('notifications').insert(adminNotifications);
      }

      // Notify claimant
      if (updatedDispute?.claimant_address) {
        await supabase.from('notifications').insert({
          user_address: updatedDispute.claimant_address,
          type: status === 'RESOLVED' ? 'dispute_resolved' : 'dispute_rejected',
          title: status === 'RESOLVED' ? 'Dispute Resolved' : 'Dispute Rejected',
          message: `Your dispute #${id} has been ${status.toLowerCase()}.`,
        });
      }

      // Notify seller/defendant
      if (updatedDispute?.seller_address) {
        await supabase.from('notifications').insert({
          user_address: updatedDispute.seller_address,
          type: status === 'RESOLVED' ? 'dispute_resolved' : 'dispute_rejected',
          title: status === 'RESOLVED' ? 'Dispute Resolved' : 'Dispute Rejected',
          message: `A dispute against you (#${id}) has been ${status.toLowerCase()}.`,
        });
      }
    } catch (notificationError) {
      console.error('Error creating dispute notifications:', notificationError);
      // Don't fail the request if notifications fail
    }

    return NextResponse.json(
      { 
        message: 'Dispute updated successfully', 
        status,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in dispute update:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
