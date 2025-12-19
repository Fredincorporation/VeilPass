import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { eventsCreated: 0, ticketsSold: 0, totalRevenue: '0' },
        { status: 200 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { searchParams } = new URL(request.url);
    const sellerAddress = searchParams.get('address');

    if (!sellerAddress) {
      return NextResponse.json(
        { error: 'Seller address required' },
        { status: 400 }
      );
    }

    // Get events created by this seller
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, base_price, tickets_sold')
      .eq('seller_address', sellerAddress);

    if (eventsError) throw eventsError;

    const eventsCreated = events?.length || 0;
    
    // Calculate total tickets sold and revenue
    let totalTicketsSold = 0;
    let totalRevenue = 0;

    events?.forEach(event => {
      const ticketsSold = event.tickets_sold || 0;
      const basePrice = event.base_price || 0;
      
      totalTicketsSold += ticketsSold;
      totalRevenue += basePrice * ticketsSold;
    });

    return NextResponse.json({
      eventsCreated,
      ticketsSold: totalTicketsSold,
      totalRevenue: totalRevenue.toFixed(2),
    });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    return NextResponse.json(
      { eventsCreated: 0, ticketsSold: 0, totalRevenue: '0' },
      { status: 200 }
    );
  }
}
