import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * POST /api/admin/broadcast
 * Send a broadcast message to all users of a specific type
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userType, createdBy } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!userType || !['customer', 'seller', 'all'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid user type. Must be "customer", "seller", or "all"' },
        { status: 400 }
      );
    }

    // Get all users based on type
    let query = supabase.from('users').select('wallet_address, role');

    if (userType === 'customer') {
      query = query.eq('role', 'customer');
    } else if (userType === 'seller') {
      query = query.eq('role', 'seller');
    }
    // If 'all', no filtering needed

    const { data: users, error: usersError } = await query;

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found to send broadcast to',
        sent_count: 0,
      });
    }

    // Create notification for each user
    const notifications = users.map(user => ({
      user_address: user.wallet_address,
      type: 'broadcast',
      title: 'Broadcast Message',
      message: message,
      read: false,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      console.error('Error creating notifications:', insertError);
      throw insertError;
    }

    // Record the broadcast in broadcasts table for audit trail
    const { error: broadcastError } = await supabase
      .from('broadcasts')
      .insert({
        message: message,
        user_type: userType,
        recipient_count: users.length,
        created_by: createdBy || null,
      });

    if (broadcastError) {
      console.error('Error recording broadcast:', broadcastError);
      // Don't throw - notifications were created successfully, just log the error
    }

    return NextResponse.json({
      success: true,
      message: `Broadcast sent to ${users.length} ${userType === 'all' ? 'users' : userType + 's'}`,
      sent_count: users.length,
    });
  } catch (error) {
    console.error('Error sending broadcast:', error);
    return NextResponse.json(
      { error: 'Failed to send broadcast' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/broadcast
 * Get all broadcasts (for audit logging)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching broadcasts:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      broadcasts: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Error getting broadcasts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch broadcasts' },
      { status: 500 }
    );
  }
}
