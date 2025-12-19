import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get('wallet');
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'wallet parameter required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
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

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
