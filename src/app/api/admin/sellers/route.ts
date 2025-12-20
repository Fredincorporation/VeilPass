import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { SellerFilterSchema, ApproveSellerSchema, validateInput, checkRateLimit, sanitizeString } from '@/lib/validation';
import { verifyAdminAuth } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/admin/sellers
 * 
 * Fetch seller applicants and approved sellers
 * Query params:
 * - status: APPROVED | PENDING | REJECTED (optional)
 * - role: seller | awaiting_seller | organizer (optional)
 * - limit: 1-100 (default: 20)
 * - offset: 0+ (default: 0)
 * 
 * Security:
 * - Requires admin authentication
 * - Input validation for all query parameters
 * - Rate limiting: 50 requests per minute
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`admin-sellers-get:${ip}`, 50, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 2. Verify admin auth
    const admin = await verifyAdminAuth();
    if (!admin) {
      console.warn('[SECURITY] Unauthorized access to /api/admin/sellers');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 3. Validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const filterData = {
      status: searchParams.get('status') || undefined,
      role: searchParams.get('role') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const validation = validateInput(SellerFilterSchema, filterData);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Extract validated values safely
    const v = validation.data || {} as any;
    const statusFilter = v.status as string | undefined;
    const roleFilter = v.role as string | undefined;
    const limitVal = typeof v.limit === 'number' ? v.limit : 20;
    const offsetVal = typeof v.offset === 'number' ? v.offset : 0;

    // 4. Build query with validated parameters
    let query = supabase
      .from('users')
      .select('id, business_name, email, role, seller_status, kyc_status, business_type, wallet_address, created_at', { count: 'exact' });

    // Apply optional filters (validated by Zod)
    if (roleFilter) {
      query = query.eq('role', roleFilter as string);
    } else {
      // Default: show awaiting_seller and approved sellers
      query = query.in('role', ['awaiting_seller', 'seller']);
    }

    if (statusFilter) {
      query = query.eq('seller_status', statusFilter as string);
    }

    const { data: sellers, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offsetVal, offsetVal + limitVal - 1);

    if (error) {
      console.error('[ERROR] Failed to fetch sellers:', error);
      return NextResponse.json({ error: 'Failed to fetch sellers' }, { status: 500 });
    }

    // 5. Transform and sanitize response
    const formattedSellers = (sellers || []).map((seller: any) => ({
      id: seller.id,
      name: sanitizeString(seller.business_name || seller.wallet_address?.slice(0, 10) || 'Unknown Seller', 100),
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
      businessType: sanitizeString(seller.business_type || 'Event Organizer', 100),
      walletAddress: seller.wallet_address,
    }));

    return NextResponse.json({
      ok: true,
      data: formattedSellers,
      total: count || 0,
      limit: limitVal,
      offset: offsetVal,
    });
  } catch (error) {
    console.error('[ERROR] /api/admin/sellers GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/sellers?id={sellerId}
 * 
 * Approve or reject a seller
 * Query params:
 * - id: seller UUID (required)
 * 
 * Request body:
 * {
 *   "status": "APPROVED" | "REJECTED",
 *   "kycStatus": "VERIFIED" | "PENDING" | "REJECTED",
 *   "reason": "Rejection reason (optional)"
 * }
 * 
 * Security:
 * - Requires admin authentication
 * - Input validation for sellerId and action
 * - Rate limiting: 20 requests per minute
 */
export async function PUT(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`admin-sellers-put:${ip}`, 20, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 2. Verify admin auth
    const admin = await verifyAdminAuth();
    if (!admin) {
      console.warn('[SECURITY] Unauthorized PUT to /api/admin/sellers');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 3. Get and validate seller ID
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('id');
    
    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sellerId)) {
      return NextResponse.json({ error: 'Invalid seller ID format' }, { status: 400 });
    }

    // 4. Parse and validate request body
    const body = await request.json();
    const validation = validateInput(ApproveSellerSchema, { ...body, sellerId });
    if (!validation.valid) {
      console.warn('[SECURITY] Invalid seller approval input:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const v2 = validation.data || {} as any;
    const statusAction = v2.status as string;
    const kycStatus = v2.kycStatus as string | undefined;
    const reason = v2.reason as string | undefined;

    // Prepare update payload
    const updatePayload: any = {
      seller_status: statusAction,
      updated_at: new Date().toISOString(),
    };

    // If approving seller, change role from awaiting_seller to seller
    if (statusAction === 'APPROVED') {
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
