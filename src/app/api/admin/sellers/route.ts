import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    console.log('📋 Fetching seller applicants with status filter:', status);

    // Query users table where role = 'awaiting_seller' (those awaiting admin review/approval)
    let query = supabase
      .from('users')
      .select('*')
      .eq('role', 'awaiting_seller');

    // If status filter provided, add it
    if (status && status !== 'all') {
      query = query.eq('seller_status', status);
    }

    const { data: sellers, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching seller applicants:', error);
      return NextResponse.json([]);
    }

    console.log('✅ Found', sellers?.length || 0, 'seller applicants');

    // Transform to match expected seller format
    const formattedSellers = (sellers || []).map((seller: any) => ({
      id: seller.id,
      name: seller.business_name || seller.wallet_address?.slice(0, 10) || 'Unknown Seller',
      email: seller.email || 'N/A',
      status: seller.seller_status || 'PENDING',
      kycStatus: seller.kyc_status || 'NOT_VERIFIED',
      submittedAt: seller.created_at 
        ? new Date(seller.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        : 'N/A',
      businessType: seller.business_type || 'Event Organizer',
      location: 'Not specified',
      walletAddress: seller.wallet_address,
    }));

    return NextResponse.json(formattedSellers);
  } catch (error) {
    console.error('❌ Error in /api/admin/sellers:', error);
    return NextResponse.json([]);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('id');
    const body = await request.json();

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID required' },
        { status: 400 }
      );
    }

    console.log('📝 Updating seller', sellerId, 'with status:', body.status);

    const { data: updatedSeller, error } = await supabase
      .from('users')
      .update({
        seller_status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sellerId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating seller:', error);
      throw error;
    }

    console.log('✅ Seller updated:', updatedSeller);

    return NextResponse.json(updatedSeller);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('❌ Error updating seller:', errorMessage);

    return NextResponse.json(
      { error: 'Failed to update seller', details: errorMessage },
      { status: 500 }
    );
  }
}
