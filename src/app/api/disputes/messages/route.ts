import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { searchParams } = new URL(request.url);
    const disputeId = searchParams.get('dispute_id');

    if (!disputeId) {
      return NextResponse.json(
        { error: 'Dispute ID required' },
        { status: 400 }
      );
    }

    // If no Supabase keys, return empty array for development
    if (!supabaseUrl || !supabaseKey) {
      console.log('[Dispute Messages API GET] No Supabase configured');
      return NextResponse.json([], { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch messages for this dispute
    const { data: messages, error } = await supabase
      .from('dispute_messages')
      .select('*')
      .eq('dispute_id', parseInt(disputeId))
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(messages || []);
  } catch (error) {
    console.error('Error fetching dispute messages:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const body = await request.json();

    // Validate required fields
    if (!body.dispute_id || !body.sender_address || !body.sender_role || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log for debugging
    console.log('[Dispute Messages API POST] Creating message:', {
      dispute_id: body.dispute_id,
      sender: body.sender_role,
      hasSupabase: !!supabaseUrl && !!supabaseKey,
    });

    // If no Supabase keys, return mock response for development
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[Dispute Messages API POST] No Supabase keys found, using mock response');
      const mockMessage = {
        id: Math.floor(Math.random() * 10000),
        dispute_id: body.dispute_id,
        sender_address: body.sender_address,
        sender_role: body.sender_role,
        message: body.message,
        status: body.status || null,
        is_status_change: body.is_status_change || false,
        created_at: new Date().toISOString(),
      };
      return NextResponse.json(mockMessage, { status: 201 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create new message
    const messageData = {
      dispute_id: parseInt(body.dispute_id),
      sender_address: body.sender_address,
      sender_role: body.sender_role,
      message: body.message,
      status: body.status || null,
      is_status_change: body.is_status_change || false,
    };

    console.log('[Dispute Messages API POST] Inserting message:', messageData);

    const { data: newMessage, error } = await supabase
      .from('dispute_messages')
      .insert([messageData])
      .select();

    if (error) {
      console.error('[Dispute Messages API POST] Database error:', error);
      throw error;
    }

    console.log('[Dispute Messages API POST] Message created successfully:', newMessage?.[0]);
    return NextResponse.json(newMessage?.[0], { status: 201 });
  } catch (error: any) {
    console.error('[Dispute Messages API POST] Catch block error:', error.message || error);
    return NextResponse.json(
      {
        error: 'Failed to create message',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
