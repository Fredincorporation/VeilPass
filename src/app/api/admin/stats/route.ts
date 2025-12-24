import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from 'next/server';
import { isAdmin } from '@/lib/wallet-roles';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export async function GET(request: NextRequest) {
  // Check admin authorization
  const adminWalletRaw = request.nextUrl.searchParams.get('admin_wallet');
  if (!adminWalletRaw || !isAdmin(adminWalletRaw)) {
    console.warn('[SECURITY] Unauthorized admin stats access from:', { raw: adminWalletRaw });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    console.log('📊 Fetching admin stats...');

    // Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('❌ Users count error:', usersError);
      throw usersError;
    }
    console.log('✅ Total users:', usersCount);

    // Get active sellers count (users with 'seller' role)
    let sellersCount = 0;
    try {
      const { count, error: sellersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'seller');

      if (!sellersError) {
        sellersCount = count || 0;
        console.log('✅ Active sellers:', sellersCount);
      }
    } catch (e) {
      console.error('❌ Sellers count error:', e);
      sellersCount = 0;
    }

    // Get open disputes count (active disputes - those NOT resolved or rejected)
    let disputesCount = 0;
    try {
      const { data: allDisputes, error: disputesError } = await supabase
        .from('disputes')
        .select('*');

      if (disputesError) {
        console.error('❌ Disputes fetch error:', disputesError);
        throw disputesError;
      }

      // Count disputes that are not RESOLVED or REJECTED (i.e., OPEN or PENDING)
      disputesCount = (allDisputes || []).filter(d => 
        d.status !== 'RESOLVED' && d.status !== 'REJECTED'
      ).length;
      
      console.log('✅ Open/active disputes:', disputesCount);
    } catch (err) {
      console.error('❌ Error counting disputes:', err);
      disputesCount = 0;
    }

    // Get total events count
    const { count: eventsCount, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (eventsError) {
      console.error('❌ Events count error:', eventsError);
      throw eventsError;
    }
    console.log('✅ Total events:', eventsCount);

    // Get total transactions (count of all tickets - each ticket = 1 transaction)
    const { count: transactionsCount, error: transactionsError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true });

    if (transactionsError) {
      console.error('❌ Transactions count error:', transactionsError);
      throw transactionsError;
    }
    console.log('✅ Total transactions (tickets):', transactionsCount);

    // Get platform volume (sum of all ticket prices in ETH)
    const { data: ticketData, error: volumeError } = await supabase
      .from('tickets')
      .select('price');

    if (volumeError) {
      console.error('❌ Platform volume error:', volumeError);
      throw volumeError;
    }

    console.log('📋 Ticket data:', ticketData);
    const platformVolumeEth = (ticketData || []).reduce((sum, ticket) => {
      const price = ticket.price || 0;
      console.log('  Ticket price:', price);
      return sum + price;
    }, 0);
    const platformVolume = platformVolumeEth.toFixed(4);
    console.log('✅ Platform volume (ETH):', platformVolume);

    const response = {
      totalUsers: usersCount || 0,
      activeSellers: sellersCount || 0,
      openDisputes: disputesCount || 0,
      totalEvents: eventsCount || 0,
      totalTransactions: transactionsCount || 0,
      platformVolume: platformVolume,
    };

    console.log('✅ Final response:', response);
    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('❌ Error fetching admin stats:', errorMessage);
    
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
