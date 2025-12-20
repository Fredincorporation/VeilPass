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

    // Query users table - get all users who have applied to be sellers
    // This includes: role = 'awaiting_seller' OR they have a seller_status set
    const { data: sellers, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'awaiting_seller')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching seller applicants:', error);
      return NextResponse.json([]);
    }

    // Also fetch approved sellers (role changed to 'seller')
    const { data: approvedSellers, error: approvedError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'seller')
      .eq('seller_status', 'APPROVED')
      .order('created_at', { ascending: false });

    if (approvedError) {
      console.error('❌ Error fetching approved sellers:', approvedError);
    }

    // Combine both lists
    const allSellers = [...(sellers || []), ...(approvedSellers || [])];
    
    console.log('✅ Found', allSellers.length, 'seller applicants');

    // Transform to match expected seller format
    const formattedSellers = (allSellers || []).map((seller: any) => ({
      id: seller.id,
      name: seller.business_name || seller.wallet_address?.slice(0, 10) || 'Unknown Seller',
      email: seller.email || 'N/A',
      role: seller.role || 'awaiting_seller',
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

    // Prepare update payload
    const updatePayload: any = {
      seller_status: body.status,
      updated_at: new Date().toISOString(),
    };

    // If approving seller, change role from awaiting_seller to seller
    if (body.status === 'APPROVED') {
      updatePayload.role = 'seller';
      console.log('🔄 Changing role to seller for approved seller');
    }

    console.log('📦 Update payload:', JSON.stringify(updatePayload));

    const { data: updatedSeller, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', sellerId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating seller:', error);
      // Handle missing column in Supabase/PostgREST schema cache (PGRST204)
      if (error.code === 'PGRST204' || (error.message && error.message.includes("Could not find the 'seller_status'"))) {
        return NextResponse.json(
          {
            error: "Database schema missing column 'seller_status'. Run migration: DATABASE_MIGRATIONS_ADD_SELLER_STATUS.sql",
            details: error.message,
          },
          { status: 500 }
        );
      }
      throw error;
    }

    console.log('✅ Seller updated:', JSON.stringify(updatedSeller));
    console.log('📊 New role:', updatedSeller?.role, 'New status:', updatedSeller?.seller_status);

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
