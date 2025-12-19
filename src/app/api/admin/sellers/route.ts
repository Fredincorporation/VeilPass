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

    let query = supabase
      .from('users')
      .select('*')
      .eq('is_seller', true);

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('seller_verification_status', status);
    }

    const { data: sellers, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sellers:', error);
      // Return empty array if table doesn't have the expected columns
      return NextResponse.json([]);
    }

    // Transform to match expected seller format
    const formattedSellers = (sellers || []).map((seller: any) => ({
      id: seller.id,
      name: seller.business_name || seller.wallet_address?.slice(0, 10),
      email: seller.email || 'N/A',
      status: seller.seller_verification_status || 'PENDING',
      kycStatus: seller.kyc_status || 'NOT_VERIFIED',
      submittedAt: seller.created_at ? new Date(seller.created_at).toLocaleDateString() : 'N/A',
      businessType: 'Event Organizer',
      location: 'Not specified',
      walletAddress: seller.wallet_address,
    }));

    return NextResponse.json(formattedSellers);
  } catch (error) {
    console.error('Error in /api/admin/sellers:', error);
    // Return empty array instead of error so UI doesn't break
    return NextResponse.json([]);
  }
}
