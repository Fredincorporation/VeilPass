import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const seller = url.searchParams.get('seller');

    let query = supabase.from('events').select('*');
    
    if (seller) {
      // Debug log
      console.log('Fetching events for seller:', seller);
      query = query.eq('organizer', seller);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Fetched events:', data?.length || 0, 'for seller:', seller);

    // Enrich events with actual ticket counts from tickets table
    const enrichedData = await Promise.all(
      (data || []).map(async (event: any) => {
        const { count: ticketCount } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);
        
        return {
          ...event,
          tickets_sold: ticketCount || event.tickets_sold || 0,
        };
      })
    );

    // Return data as-is without status transformation
    return NextResponse.json(enrichedData || []);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      );
    }

    // Validate and ensure base_price is set
    const basePrice = parseFloat(body.base_price || '0');
    if (isNaN(basePrice) || basePrice < 0) {
      return NextResponse.json(
        { error: 'Invalid base_price: must be a positive number' },
        { status: 400 }
      );
    }

    // Extract ticket tiers from request body
    const tiers = body.ticket_tiers || [];
    delete body.ticket_tiers; // Remove from event data

    // Ensure timestamps and base_price
    const eventData = {
      ...body,
      base_price: basePrice, // Ensure base_price is always a number
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select();

    if (error) throw error;

    const createdEvent = data[0];
    console.log('Event created successfully:', createdEvent);

    // If tiers are provided, create them as well
    if (tiers.length > 0) {
      const tierData = tiers.map((tier: any, index: number) => ({
        event_id: createdEvent.id,
        name: tier.name,
        description: tier.description || '',
        price: parseFloat(tier.price) || 0,
        available: parseInt(tier.quantity) || 0,
        sold: 0,
        features: tier.features || [],
        display_order: index + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: tiersError } = await supabase
        .from('ticket_tiers')
        .insert(tierData);

      if (tiersError) {
        console.error('Error creating ticket tiers:', tiersError);
        // Don't fail the whole request if tiers fail, but log it
      } else {
        console.log('Ticket tiers created successfully:', tierData.length);
      }
    }

    // Notify admins about new event submitted for approval
    try {
      const { data: admins } = await supabaseAdmin
        .from('users')
        .select('wallet_address')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const adminNotifications = admins.map(admin => ({
          user_address: admin.wallet_address,
          type: 'event_pending_approval',
          title: 'New Event Pending Approval',
          message: `New event "${createdEvent.title}" has been submitted and is waiting for admin approval. Review at /admin/events`,
        }));
        await supabaseAdmin.from('notifications').insert(adminNotifications);
      }

      // Notify seller about submission
      if (createdEvent.organizer) {
        await supabaseAdmin.from('notifications').insert({
          user_address: createdEvent.organizer,
          type: 'event_submitted',
          title: 'Event Submitted for Review',
          message: `Your event "${createdEvent.title}" has been submitted and is pending admin approval. You'll be notified once reviewed.`,
        });
      }
    } catch (notificationError) {
      console.error('Error creating event notifications:', notificationError);
      // Don't fail the request if notifications fail
    }

    return NextResponse.json(createdEvent, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    const eventData = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Remove id from the update payload to avoid conflicts
    const { id, ...updateData } = eventData;

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    console.log('Event updated successfully:', data[0]);
    return NextResponse.json(data[0], { status: 200 });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
