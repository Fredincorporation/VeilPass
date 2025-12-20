import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { determineTicketStatus } from '@/lib/ticketStatusUtils';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get('owner');
    
    let query = supabase
      .from('tickets')
      .select('*, events(title, date)')
      .order('created_at', { ascending: false });

    if (walletAddress) {
      query = query.eq('owner_address', walletAddress);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Flatten the events join and update ticket status based on current event date
    const ticketsWithEventName = (data as any[]).map((ticket: any) => {
      const eventDate = ticket.events?.date;
      const currentStatus = determineTicketStatus(eventDate, ticket.status);
      
      return {
        ...ticket,
        event_title: ticket.events?.title || `Event #${ticket.event_id}`,
        status: currentStatus, // Use current determined status (in case date changed)
      };
    });

    return NextResponse.json(ticketsWithEventName);
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📝 Creating ticket with data:', body);

    // Validate required fields
    if (!body.event_id || !body.owner_address) {
      return NextResponse.json(
        { error: 'Missing required fields: event_id and owner_address' },
        { status: 400 }
      );
    }

    // Fetch event details to get the date
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, date, organizer')
      .eq('id', body.event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Determine ticket status based on event date
    const ticketStatus = determineTicketStatus(event.date, body.status);
    console.log(`📅 Event date: ${event.date} → Ticket status: ${ticketStatus}`);

    // Ensure we have required fields - only include fields that exist in the schema
    const ticketData: any = {
      event_id: body.event_id,
      owner_address: body.owner_address,
      section: body.section || 'general',
      price: body.price || 0,
      status: ticketStatus, // Auto-determined status
      created_at: new Date().toISOString(),
    };

    // Include transaction_hash if provided (for blockchain transaction tracking)
    if (body.transaction_hash) {
      ticketData.transaction_hash = body.transaction_hash;
      console.log('✅ Transaction hash included:', body.transaction_hash);
    }

    // Include ticket_number if provided
    if (body.ticket_number) {
      ticketData.ticket_number = body.ticket_number;
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert([ticketData])
      .select();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Ticket created successfully:', data[0]);

    // Notify seller/organizer about new ticket sale
    try {
      await supabaseAdmin.from('notifications').insert({
        user_address: event.organizer,
        type: 'ticket_sold',
        title: 'Ticket Sold',
        message: `A ticket for "${event.title}" has been purchased by ${body.owner_address.slice(0, 10)}...`,
      });

      // Notify all admins about ticket sale
      const { data: admins } = await supabaseAdmin
        .from('users')
        .select('wallet_address')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const adminNotifications = admins.map(admin => ({
          user_address: admin.wallet_address,
          type: 'ticket_sold',
          title: 'New Ticket Sale',
          message: `Ticket sold for event "${event.title}" at ${body.price || 'market'} price.`,
        }));
        await supabaseAdmin.from('notifications').insert(adminNotifications);
      }
    } catch (notificationError) {
      console.error('Error creating ticket sale notifications:', notificationError);
      // Don't fail the request if notifications fail
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating ticket:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...body } = await request.json();

    const { data, error } = await supabase
      .from('tickets')
      .update(body)
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
