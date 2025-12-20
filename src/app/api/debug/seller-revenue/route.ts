import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/debug/seller-revenue?seller=0x...
 * 
 * Debug endpoint to see what's happening with revenue calculation
 */
export async function GET(request: NextRequest) {
  try {
    const seller = request.nextUrl.searchParams.get('seller');

    if (!seller) {
      return NextResponse.json({ error: 'Missing seller parameter' }, { status: 400 });
    }

    // Step 1: Get all events for seller
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('organizer', seller);

    if (eventsError) {
      return NextResponse.json({
        error: 'Failed to fetch events',
        details: eventsError,
      });
    }

    if (!events) {
      return NextResponse.json({
        error: 'No events found',
        seller,
      });
    }

    // Step 2: For each event, get tickets
    const eventIds = events.map((e: any) => e.id);
    
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*');

    if (ticketsError) {
      return NextResponse.json({
        error: 'Failed to fetch tickets',
        details: ticketsError,
      });
    }

    // Step 3: Calculate revenue
    const ticketsForEvents = (tickets || []).filter((t: any) => eventIds.includes(t.event_id));
    
    const breakdown = events.map((event: any) => {
      const eventTickets = ticketsForEvents.filter((t: any) => t.event_id === event.id);
      const totalPrice = eventTickets.reduce((sum: number, t: any) => {
        const price = typeof t.price === 'string' ? parseFloat(t.price) : (t.price || 0);
        console.log(`Ticket ${t.id}: price=${t.price} (type: ${typeof t.price})`);
        return sum + price;
      }, 0);

      return {
        eventId: event.id,
        eventTitle: event.title,
        eventBasePrice: event.base_price,
        eventTicketsSold: event.tickets_sold,
        ticketsInDB: eventTickets.length,
        ticketPrices: eventTickets.map((t: any) => ({
          id: t.id,
          price: t.price,
          owner: t.owner_address,
        })),
        calculatedRevenue: totalPrice.toFixed(2),
      };
    });

    const totalTickets = ticketsForEvents.length;
    const totalRevenue = ticketsForEvents
      .reduce((sum: number, t: any) => {
        const price = typeof t.price === 'string' ? parseFloat(t.price) : (t.price || 0);
        return sum + price;
      }, 0)
      .toFixed(2);

    return NextResponse.json({
      seller,
      eventCount: events.length,
      ticketCount: totalTickets,
      totalRevenue,
      events: breakdown,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    });
  }
}
