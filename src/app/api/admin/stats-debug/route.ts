import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    console.log('=== ADMIN STATS DEBUG ===');
    
    // Test 1: Get users
    const { data: usersDataFull, count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    console.log('Users Query - Count:', usersCount, 'Error:', usersError);
    console.log('Users Data Sample:', usersDataFull?.slice(0, 1));

    // Test 2: Get tickets
    const { data: ticketsDataFull, count: ticketsCount, error: ticketsError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact' });

    console.log('Tickets Query - Count:', ticketsCount, 'Error:', ticketsError);
    console.log('Tickets Data Sample:', ticketsDataFull?.slice(0, 1));

    // Test 3: Get disputes
    const { data: disputesDataFull, count: disputesCount, error: disputesError } = await supabase
      .from('disputes')
      .select('*', { count: 'exact' });

    console.log('Disputes Query - Count:', disputesCount, 'Error:', disputesError);
    console.log('Disputes Data Sample:', disputesDataFull?.slice(0, 1));

    // Test 4: Get events
    const { data: eventsDataFull, count: eventsCount, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact' });

    console.log('Events Query - Count:', eventsCount, 'Error:', eventsError);
    console.log('Events Data Sample:', eventsDataFull?.slice(0, 1));

    // Calculate platform volume
    const platformVolumeEth = (ticketsDataFull || []).reduce((sum, ticket) => sum + (ticket.price || 0), 0);

    // Get disputes by status
    const { count: openDisputesCount } = await supabase
      .from('disputes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'OPEN');

    console.log('Open Disputes Count:', openDisputesCount);

    const responseData = {
      totalUsers: usersCount || 0,
      totalTransactions: ticketsCount || 0,
      openDisputes: openDisputesCount || 0,
      totalEvents: eventsCount || 0,
      platformVolume: platformVolumeEth.toFixed(4),
      debug: {
        usersError: usersError?.message,
        ticketsError: ticketsError?.message,
        disputesError: disputesError?.message,
        eventsError: eventsError?.message,
        usersSample: usersDataFull?.[0],
        ticketsSample: ticketsDataFull?.[0],
      }
    };

    console.log('Final Response:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('DEBUG ERROR:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      totalUsers: 0,
      totalTransactions: 0,
      openDisputes: 0,
      totalEvents: 0,
      platformVolume: '0.0000',
    });
  }
}
