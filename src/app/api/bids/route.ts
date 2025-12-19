import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const auctionId = request.nextUrl.searchParams.get('auctionId');
    
    let query = supabase
      .from('bids')
      .select('*')
      .order('created_at', { ascending: false });

    if (auctionId) {
      query = query.eq('auction_id', auctionId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching bids:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('bids')
      .insert([body])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error('Error placing bid:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
