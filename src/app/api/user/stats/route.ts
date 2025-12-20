import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDualCurrency } from '@/lib/currency-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Get all tickets for the user
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('price, status')
      .eq('owner_address', address);

    if (error) {
      console.error('Error fetching tickets:', error);
      return NextResponse.json(
        { activeTickets: 0, totalSpent: { eth: '0.0000 ETH', usd: '$0.00' } }
      );
    }

    // Calculate stats
    const activeTickets = (tickets || []).filter(
      ticket => ticket.status === 'active' || ticket.status === 'upcoming'
    ).length;

    const totalSpentEth = (tickets || []).reduce((sum, ticket) => sum + (ticket.price || 0), 0);

    // Get both ETH and USD representations
    const currencyData = getDualCurrency(totalSpentEth);

    return NextResponse.json({
      activeTickets,
      totalSpent: {
        eth: currencyData.eth,
        usd: currencyData.usd,
      },
    });
  } catch (error) {
    console.error('Error in /api/user/stats:', error);
    return NextResponse.json(
      { activeTickets: 0, totalSpent: { eth: '0.0000 ETH', usd: '$0.00' } }
    );
  }
}
