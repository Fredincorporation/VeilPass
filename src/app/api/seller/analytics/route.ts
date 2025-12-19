import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { 
          metrics: {
            totalRevenue: '0',
            ticketsSold: 0,
            activeEvents: 0,
            avgRevenuePerEvent: '0',
          },
          topEvents: [],
          recentTransactions: [],
        },
        { status: 200 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);
    const sellerAddress = searchParams.get('seller');

    if (!sellerAddress) {
      return NextResponse.json(
        { error: 'Seller address required' },
        { status: 400 }
      );
    }

    // Get all events for this seller
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, base_price, tickets_sold, capacity, created_at')
      .eq('seller_address', sellerAddress);

    if (eventsError) throw eventsError;

    if (!events || events.length === 0) {
      return NextResponse.json({
        metrics: {
          totalRevenue: '0',
          ticketsSold: 0,
          activeEvents: 0,
          avgRevenuePerEvent: '0',
        },
        topEvents: [],
        recentTransactions: [],
      });
    }

    // Calculate metrics
    let totalRevenue = 0;
    let totalTicketsSold = 0;

    events.forEach(event => {
      const ticketsSold = event.tickets_sold || 0;
      const basePrice = event.base_price || 0;
      totalTicketsSold += ticketsSold;
      totalRevenue += basePrice * ticketsSold;
    });

    const activeEvents = events.length;
    const avgRevenuePerEvent = activeEvents > 0 ? (totalRevenue / activeEvents).toFixed(2) : '0';

    // Get top events by revenue
    const topEvents = events
      .map(event => ({
        id: event.id,
        title: event.title,
        revenue: (event.base_price || 0) * (event.tickets_sold || 0),
        tickets: event.tickets_sold || 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    // Get recent transactions (tickets sold) - simulate from events data
    const recentTransactions = events
      .flatMap(event => 
        Array.from({ length: event.tickets_sold || 0 }, (_, i) => ({
          id: `${event.id}-${i}`,
          event: event.title,
          tickets: 1,
          amount: (event.base_price || 0),
          date: new Date(event.created_at).toISOString().split('T')[0],
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    // Monthly revenue data for chart
    const revenueData = getMonthlyData(events);

    return NextResponse.json({
      metrics: {
        totalRevenue: totalRevenue.toFixed(2),
        ticketsSold: totalTicketsSold,
        activeEvents,
        avgRevenuePerEvent,
      },
      topEvents,
      recentTransactions,
      revenueData,
    });
  } catch (error) {
    console.error('Error fetching seller analytics:', error);
    return NextResponse.json(
      { 
        metrics: {
          totalRevenue: '0',
          ticketsSold: 0,
          activeEvents: 0,
          avgRevenuePerEvent: '0',
        },
        topEvents: [],
        recentTransactions: [],
      },
      { status: 200 }
    );
  }
}

function getMonthlyData(events: any[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyRevenue: { [key: string]: number } = {};

  // Initialize all months to 0
  months.forEach(month => {
    monthlyRevenue[month] = 0;
  });

  // Accumulate revenue by month
  events.forEach(event => {
    const date = new Date(event.created_at);
    const month = months[date.getMonth()];
    const revenue = (event.base_price || 0) * (event.tickets_sold || 0);
    monthlyRevenue[month] += revenue;
  });

  return months.map(month => ({
    month,
    revenue: Math.round(monthlyRevenue[month]),
  }));
}
