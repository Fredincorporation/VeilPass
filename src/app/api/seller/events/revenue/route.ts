import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/seller/events/revenue
 * 
 * Calculate total revenue for a seller based on actual ticket prices
 * Revenue = sum of all ticket prices sold by this seller's events
 */
export async function GET(request: NextRequest) {
  try {
    const seller = request.nextUrl.searchParams.get('seller');

    if (!seller) {
      return NextResponse.json(
        { error: 'Missing seller parameter' },
        { status: 400 }
      );
    }

    // 1. Get all events for this seller
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, base_price, tickets_sold')
      .eq('organizer', seller);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        totalRevenue: '0.00',
        totalTickets: 0,
        breakdown: [],
      });
    }

    const eventIds = events.map((e: any) => e.id);

    // 2. Get all tickets for these events and sum their prices
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('event_id, price');

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError);
      // Fallback to base_price calculation
      const revenue = events.reduce((sum: number, e: any) => {
        return sum + ((e.base_price || 0) * (e.tickets_sold || 0));
      }, 0);
      
      return NextResponse.json({
        totalRevenue: revenue.toFixed(2),
        totalTickets: events.reduce((sum: number, e: any) => sum + (e.tickets_sold || 0), 0),
        breakdown: events.map((e: any) => ({
          eventId: e.id,
          ticketsSold: e.tickets_sold || 0,
          unitPrice: e.base_price || 0,
          revenue: ((e.base_price || 0) * (e.tickets_sold || 0)).toFixed(2),
        })),
      });
    }

    // 3. Calculate revenue per event
    const breakdown = events.map((event: any) => {
      const eventTickets = tickets.filter((t: any) => t.event_id === event.id);
      const eventRevenue = eventTickets.reduce((sum: number, t: any) => {
          const ticketPrice = t.price ? parseFloat(String(t.price)) : parseFloat(String(event.base_price || 0));
          return sum + (isNaN(ticketPrice) ? 0 : ticketPrice);
      }, 0);

      return {
        eventId: event.id,
        ticketsSold: eventTickets.length,
        unitPrice: event.base_price || 0,
        revenue: eventRevenue.toFixed(2),
        avgPrice: eventTickets.length > 0 
          ? (eventRevenue / eventTickets.length).toFixed(2)
          : '0.00',
      };
    });

    // 4. Sum total revenue
    const totalRevenue = breakdown
      .reduce((sum: number, item: any) => sum + parseFloat(item.revenue), 0)
      .toFixed(2);

    const totalTickets = breakdown.reduce((sum: number, item: any) => sum + item.ticketsSold, 0);

    return NextResponse.json({
      totalRevenue,
      totalTickets,
      breakdown,
    });
  } catch (error: any) {
    console.error('Error calculating revenue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
