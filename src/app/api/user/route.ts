import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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

    // Normalize wallet address to lowercase for consistency
    const normalizedAddress = walletAddress.toLowerCase();

    // Allow clients to request only specific fields (comma-separated) to reduce payload
    // Example: /api/user?wallet=0x...&fields=role,wallet_address
    const selectFields = fieldsParam && fieldsParam.trim().length > 0 ? fieldsParam : '*';

    const { data, error } = await supabase
      .from('users')
      .select(selectFields)
      .ilike('wallet_address', normalizedAddress)
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create one
      return createUser(normalizedAddress);
    }

    if (error) {
      console.error('Supabase error fetching user:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        status: error.status,
      });
      
      // Return a fallback user object if database isn't ready yet
      // This allows the frontend to continue functioning during setup
      console.warn(`Database unavailable, returning fallback user for ${normalizedAddress}`);
      return NextResponse.json({
        wallet_address: normalizedAddress,
        role: 'customer',
        loyalty_points: 0,
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    
    // Fallback response to prevent blocking the UI
    const walletAddress = request.nextUrl.searchParams.get('wallet');
    if (walletAddress) {
      return NextResponse.json({
        wallet_address: walletAddress.toLowerCase(),
        role: 'customer',
        loyalty_points: 0,
      });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

async function createUser(walletAddress: string) {
  try {
    console.log('Creating new user:', walletAddress);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        wallet_address: walletAddress,
        role: 'customer',
        loyalty_points: 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating user:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        status: error.status,
      });
      
      // Return fallback if database isn't ready
      console.warn(`Failed to create user in DB, returning fallback for ${walletAddress}`);
      return NextResponse.json({
        wallet_address: walletAddress,
        role: 'customer',
        loyalty_points: 0,
      });
    }

    console.log('User created successfully:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Return fallback on error
    return NextResponse.json({
      wallet_address: walletAddress,
      role: 'customer',
      loyalty_points: 0,
    });
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
