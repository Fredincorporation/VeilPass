import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

export async function GET() {
  try {
    // Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get active sellers count (users with 'seller' role)
    let sellersCount = 0;
    try {
      const { count, error: sellersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'seller');

      if (!sellersError) {
        sellersCount = count || 0;
      }
    } catch (e) {
      console.error('Sellers count error:', e);
      sellersCount = 0;
    }

    // Get open disputes count (active disputes)
    const { count: disputesCount, error: disputesError } = await supabase
      .from('disputes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'OPEN');

    if (disputesError) throw disputesError;

    // Get total events count
    const { count: eventsCount, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (eventsError) throw eventsError;

    // Get total transactions (count of all tickets)
    const { count: transactionsCount, error: transactionsError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true });

    if (transactionsError) throw transactionsError;

    // Get platform volume (sum of all ticket prices in ETH)
    const { data: ticketData, error: volumeError } = await supabase
      .from('tickets')
      .select('price');

    if (volumeError) throw volumeError;

    const platformVolumeEth = (ticketData || []).reduce((sum, ticket) => sum + (ticket.price || 0), 0);
    const platformVolume = platformVolumeEth.toFixed(4);

    return NextResponse.json({
      totalUsers: usersCount || 0,
      activeSellers: sellersCount || 0,
      openDisputes: disputesCount || 0,
      totalEvents: eventsCount || 0,
      totalTransactions: transactionsCount || 0,
      platformVolume: platformVolume,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Error fetching admin stats:', errorMessage);
    
    // Return success with zero values instead of error
    return NextResponse.json({
      totalUsers: 0,
      activeSellers: 0,
      openDisputes: 0,
      totalEvents: 0,
      totalTransactions: 0,
      platformVolume: '0.0000',
    });
  }
}
