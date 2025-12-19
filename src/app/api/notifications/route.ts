import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * GET /api/notifications?user=wallet_address
 * Fetch notifications for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('user');

    // If no user address, return empty array (user not logged in)
    if (!userAddress) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_address', userAddress)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Notifications GET error:', error);
      // Return empty array on error so UI doesn't break
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Notifications GET error:', error);
    // Return empty array on error instead of 500 so UI doesn't break
    return NextResponse.json([]);
  }
}
