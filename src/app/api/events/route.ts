import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const seller = url.searchParams.get('seller');

    let query = supabase.from('events').select('*');
    
    if (seller) {
      query = query.eq('organizer', seller);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch business names for all organizers
    if (data && data.length > 0) {
      const organizers = [...new Set(data.map((e: any) => e.organizer))].filter(Boolean);
      
      let usersQuery = supabase.from('users').select('wallet_address, business_name');
      if (organizers.length > 0) {
        usersQuery = usersQuery.in('wallet_address', organizers);
      }
      
      const { data: users } = await usersQuery;
      const userMap = Object.fromEntries(
        (users || []).map((u: any) => [u.wallet_address, u.business_name || u.wallet_address])
      );

      // Transform data to use business_name as organizer
      const transformedData = data.map((event: any) => ({
        ...event,
        organizer: userMap[event.organizer] || event.organizer,
        status: event.status === 'Live Auction' ? 'On Sale' : event.status,
      }));

      return NextResponse.json(transformedData);
    }

    // Transform old status values to new ones for backward compatibility
    const transformedData = data?.map((event: any) => ({
      ...event,
      status: event.status === 'Live Auction' ? 'On Sale' : event.status,
    })) || [];

    return NextResponse.json(transformedData);
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

    // Extract ticket tiers from request body
    const tiers = body.ticket_tiers || [];
    delete body.ticket_tiers; // Remove from event data

    // Ensure timestamps
    const eventData = {
      ...body,
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
