import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { captureException } from '@/lib/logger';
import logger from '@/lib/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: { sellerId: string } }
) {
  try {
    const sellerId = params.sellerId;
    const body = await request.json();

    logger.info('📝 Updating seller', sellerId, 'with status:', body.status);

    // Prepare update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // If status is APPROVED, change role from 'awaiting_seller' to 'seller'
    if (body.status === 'APPROVED') {
      updateData.role = 'seller';
      logger.info('✅ Changing role from awaiting_seller to seller on approval');
    } else if (body.status === 'REJECTED') {
      // If rejected, revert to customer
      updateData.role = 'customer';
      logger.info('✅ Reverting role to customer on rejection');
    }

    const { data: updatedSeller, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', sellerId)
      .select()
      .single();

    if (error) {
      captureException('❌ Error updating seller:', error);
      throw error;
    }

    logger.info('✅ Seller updated:', updatedSeller);

    // Send notifications based on the status
    if (body.status === 'APPROVED') {
      // 1. Send notification to the seller (applicant)
      try {
        await supabase
          .from('notifications')
          .insert({
            user_address: updatedSeller.wallet_address,
            type: 'seller_approved',
            title: 'Seller Application Approved',
            message: `Congratulations! Your seller application has been approved. You can now create and manage events on VeilPass.`,
          });
      } catch (notificationError) {
        captureException('Error creating seller approval notification:', notificationError);
        // Don't fail the request if notification fails
      }
    } else if (body.status === 'REJECTED') {
      // 1. Send notification to the seller (applicant)
      try {
        await supabase
          .from('notifications')
          .insert({
            user_address: updatedSeller.wallet_address,
            type: 'seller_rejected',
            title: 'Seller Application Rejected',
            message: `Your seller application has been rejected. Please review your information and try again.`,
          });
      } catch (notificationError) {
        captureException('Error creating seller rejection notification:', notificationError);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json(updatedSeller);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    captureException('❌ Error updating seller:', errorMessage);

    return NextResponse.json(
      { error: 'Failed to update seller', details: errorMessage },
      { status: 500 }
    );
  }
}
