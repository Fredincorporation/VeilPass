import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get('wallet');
    const fieldsParam = request.nextUrl.searchParams.get('fields');
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'wallet parameter required' },
        { status: 400 }
      );
    }

    // Allow clients to request only specific fields (comma-separated) to reduce payload
    // Example: /api/user?wallet=0x...&fields=role,wallet_address
    const selectFields = fieldsParam && fieldsParam.trim().length > 0 ? fieldsParam : '*';

    const { data, error } = await supabase
      .from('users')
      .select(selectFields)
      .eq('wallet_address', walletAddress)
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create one
      return createUser(walletAddress);
    }

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function createUser(walletAddress: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        wallet_address: walletAddress,
        role: 'customer',
        loyalty_points: 0,
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { wallet_address, ...updates } = await request.json();

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('wallet_address', wallet_address)
      .select()
      .single();

    if (error) throw error;

    // If role is being changed to 'awaiting_seller', notify admins
    if (updates.role === 'awaiting_seller') {
      try {
        // Get all admin users
        const { data: admins } = await supabase
          .from('users')
          .select('wallet_address')
          .eq('role', 'admin');

        // Create notification for each admin
        if (admins && admins.length > 0) {
          const notifications = admins.map(admin => ({
            user_address: admin.wallet_address,
            type: 'seller_application',
            title: 'New Seller Application',
            message: `A new seller application has been submitted. Business: ${updates.business_name || 'Unnamed'}. Please review at /admin/sellers`,
          }));

          await supabase
            .from('notifications')
            .insert(notifications);
        }
      } catch (notificationError) {
        console.error('Error creating admin notification:', notificationError);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
