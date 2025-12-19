import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = parseInt(params.eventId);

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing event ID' },
        { status: 400 }
      );
    }

    // Count tickets sold for this event
    const { count, error } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'active');

    if (error) throw error;

    return NextResponse.json({ count: count || 0 });
  } catch (error: any) {
    console.error('Error fetching ticket count:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
