import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Check if disputes table exists and has data
    const { data: disputes, error: disputesError, count: disputesCount } = await supabase
      .from('disputes')
      .select('*', { count: 'exact' });

    if (disputesError) {
      return NextResponse.json({
        error: 'Error querying disputes',
        details: disputesError.message,
      }, { status: 500 });
    }

    // Check if dispute_messages table exists and has data
    const { data: messages, error: messagesError, count: messagesCount } = await supabase
      .from('dispute_messages')
      .select('*', { count: 'exact' });

    if (messagesError) {
      return NextResponse.json({
        error: 'Error querying dispute_messages',
        details: messagesError.message,
      }, { status: 500 });
    }

    // Check tickets table
    const { data: tickets, count: ticketsCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact' });

    // Check events table
    const { data: events, count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact' });

    return NextResponse.json({
      tables: {
        disputes: {
          count: disputesCount || 0,
          data: disputes || [],
          sample: (disputes || []).slice(0, 1),
        },
        dispute_messages: {
          count: messagesCount || 0,
          data: messages || [],
          sample: (messages || []).slice(0, 1),
        },
        tickets: {
          count: ticketsCount || 0,
          sample: (tickets || []).slice(0, 1),
        },
        events: {
          count: eventsCount || 0,
          sample: (events || []).slice(0, 1),
        },
      },
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: String(error),
    }, { status: 500 });
  }
}
