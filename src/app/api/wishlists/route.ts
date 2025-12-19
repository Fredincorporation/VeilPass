import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userAddress = url.searchParams.get('user');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_address', userAddress)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error fetching wishlists:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.user_address || body.event_id === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: user_address and event_id' },
        { status: 400 }
      );
    }

    // Check if already wishlisted
    const { data: existing } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_address', body.user_address)
      .eq('event_id', body.event_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Event already in wishlist' },
        { status: 409 }
      );
    }

    const wishlistData = {
      user_address: body.user_address,
      event_id: body.event_id,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('wishlists')
      .insert([wishlistData])
      .select();

    if (error) throw error;

    console.log('Added to wishlist:', data[0]);
    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.user_address || body.event_id === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: user_address and event_id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_address', body.user_address)
      .eq('event_id', body.event_id);

    if (error) throw error;

    console.log('Removed from wishlist');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
