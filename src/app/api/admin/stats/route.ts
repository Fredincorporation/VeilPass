import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from 'next/server';
import { isAdmin } from '@/lib/wallet-roles';
import { captureException } from '@/lib/logger';
import logger from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  captureException('Missing Supabase credentials');
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export async function GET(request: NextRequest) {
  // Check admin authorization
  const adminWalletRaw = request.nextUrl.searchParams.get('admin_wallet');
  if (!adminWalletRaw || !isAdmin(adminWalletRaw)) {
    logger.warn('[SECURITY] Unauthorized admin stats access from:', { raw: adminWalletRaw });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    logger.info('📊 Fetching admin stats...');

    // Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      captureException('❌ Users count error:', usersError);
      throw usersError;
    }
    logger.info('✅ Total users:', usersCount);

    // Get active sellers count (users with 'seller' role)
    let sellersCount = 0;
    try {
      const { count, error: sellersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'seller');

      if (!sellersError) {
        sellersCount = count || 0;
        logger.info('✅ Active sellers:', sellersCount);
      }
    } catch (e) {
      captureException('❌ Sellers count error:', e);
      sellersCount = 0;
    }

    // Get open disputes count (active disputes - those NOT resolved or rejected)
    let disputesCount = 0;
    try {
      const { data: allDisputes, error: disputesError } = await supabase
        .from('disputes')
        .select('*');

      if (disputesError) {
        captureException('❌ Disputes fetch error:', disputesError);
        throw disputesError;
      }

      // Count disputes that are not RESOLVED or REJECTED (i.e., OPEN or PENDING)
      disputesCount = (allDisputes || []).filter(d => 
        d.status !== 'RESOLVED' && d.status !== 'REJECTED'
      ).length;
      
      logger.info('✅ Open/active disputes:', disputesCount);
    } catch (err) {
      captureException('❌ Error counting disputes:', err);
      disputesCount = 0;
    }

    // Get total events count
    const { count: eventsCount, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (eventsError) {
      captureException('❌ Events count error:', eventsError);
      throw eventsError;
    }
    logger.info('✅ Total events:', eventsCount);

    // Get total transactions (count of all tickets - each ticket = 1 transaction)
    const { count: transactionsCount, error: transactionsError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true });

    if (transactionsError) {
      captureException('❌ Transactions count error:', transactionsError);
      throw transactionsError;
    }
    logger.info('✅ Total transactions (tickets):', transactionsCount);

    // Get platform volume (sum of all ticket prices in ETH)
    const { data: ticketData, error: volumeError } = await supabase
      .from('tickets')
      .select('price');

    if (volumeError) {
      captureException('❌ Platform volume error:', volumeError);
      throw volumeError;
    }

    logger.info('📋 Ticket data:', ticketData);
    const platformVolumeEth = (ticketData || []).reduce((sum, ticket) => {
      const price = ticket.price || 0;
      logger.info('  Ticket price:', price);
      return sum + price;
    }, 0);
    const platformVolume = platformVolumeEth.toFixed(4);
    logger.info('✅ Platform volume (ETH):', platformVolume);

    const response = {
      totalUsers: usersCount || 0,
      activeSellers: sellersCount || 0,
      openDisputes: disputesCount || 0,
      totalEvents: eventsCount || 0,
      totalTransactions: transactionsCount || 0,
      platformVolume: platformVolume,
    };

    logger.info('✅ Final response:', response);
    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    captureException('❌ Error fetching admin stats:', errorMessage);
    
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
