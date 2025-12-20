import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Disable caching for dynamic event data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Only select necessary fields to avoid large cache issues
    const { data, error } = await supabase
      .from('events')
      .select('id, title, description, date, location, image, base_price, capacity, status, organizer, tickets_sold, created_at, updated_at')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Fetch organizer's business_name
    let businessName = data.organizer;
    if (data.organizer) {
      const { data: userData } = await supabase
        .from('users')
        .select('business_name')
        .eq('wallet_address', data.organizer)
        .single();
      
      if (userData?.business_name) {
        businessName = userData.business_name;
      }
    }

    // Fetch ticket tiers for this event
    const { data: tiers, error: tiersError } = await supabase
      .from('ticket_tiers')
      .select('id, name, description, price, available, sold, features, display_order')
      .eq('event_id', eventId)
      .order('display_order', { ascending: true });

    if (tiersError) {
      console.error('Error fetching ticket tiers:', tiersError);
    }

    // Transform old status values for backward compatibility
    const transformedData = {
      ...data,
      organizer: businessName,
      ticket_tiers: tiers || [],
      status: data.status === 'Live Auction' ? 'On Sale' : data.status,
    };

    return NextResponse.json(transformedData);
  } catch (error: any) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
