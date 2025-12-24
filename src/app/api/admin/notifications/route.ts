import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/wallet-roles';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * GET /api/admin/notifications
 * Fetch notifications for all admins
 * Query params:
 *   - admin_wallet: specific admin wallet address (optional, if not provided returns all admin notifications)
 *   - unread_only: true to get only unread notifications (optional)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const adminWalletRaw = searchParams.get('admin_wallet');

  // Check admin authorization - pass raw address to isAdmin()
  if (!adminWalletRaw || !isAdmin(adminWalletRaw)) {
    console.warn('[SECURITY] Unauthorized admin notifications access from:', { raw: adminWalletRaw });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const adminWallet = adminWalletRaw.trim().toLowerCase();
    const unreadOnly = searchParams.get('unread_only') === 'true';

    let query = supabase
      .from('notifications')
      .select('*');

    // If specific admin wallet provided, get notifications for that admin
    if (adminWallet) {
      query = query.eq('user_address', adminWallet);
    } else {
      // Otherwise, get notifications for all admin users
      // First, get all admins
      const { data: admins } = await supabase
        .from('users')
        .select('wallet_address')
        .eq('role', 'admin');

      if (!admins || admins.length === 0) {
        return NextResponse.json([]);
      }

      const adminWallets = admins.map(a => a.wallet_address);
      query = query.in('user_address', adminWallets);
    }

    // Filter for unread if requested
    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin notifications:', error);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in admin notifications GET:', error);
    return NextResponse.json([]);
  }
}

/**
 * PUT /api/admin/notifications
 * Mark admin notifications as read or update them
 * Body: { notification_ids: number[], read: boolean }
 */
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const adminWalletRaw = searchParams.get('admin_wallet');

  // Check admin authorization - pass raw address to isAdmin()
  if (!adminWalletRaw || !isAdmin(adminWalletRaw)) {
    console.warn('[SECURITY] Unauthorized admin notifications update from:', { raw: adminWalletRaw });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const adminWallet = adminWalletRaw.trim().toLowerCase();
    const body = await request.json();
    const { notification_ids, read } = body;

    if (!notification_ids || !Array.isArray(notification_ids)) {
      return NextResponse.json(
        { error: 'notification_ids array is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: read !== undefined ? read : true })
      .in('id', notification_ids)
      .select();

    if (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `${data?.length || 0} notifications updated`,
      data,
    });
  } catch (error) {
    console.error('Error in admin notifications PUT:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
