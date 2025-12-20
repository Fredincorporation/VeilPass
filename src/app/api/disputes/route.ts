import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// In-memory store for development/testing without Supabase
const mockDisputes: Record<string, any[]> = {};

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('user');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address required' },
        { status: 400 }
      );
    }

    // If no Supabase keys, return from mock store for development
    if (!supabaseUrl || !supabaseKey) {
      const userDisputes = mockDisputes[userAddress] || [];
      return NextResponse.json(userDisputes, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch disputes for this user
    const { data: disputes, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('user_address', userAddress)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(disputes || []);
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const body = await request.json();

    // Validate required fields first
    if (!body.user_address || !body.ticket_id || !body.reason) {
      return NextResponse.json(
        { error: 'Missing required fields: user_address, ticket_id, reason' },
        { status: 400 }
      );
    }

    // Handle ticket_id - if it's not a UUID, try to find it or create a placeholder UUID
    let ticketId = body.ticket_id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(ticketId)) {
      // If not a UUID, create a deterministic UUID from the ticket string
      // Using SHA-1 hash approach: convert string to a UUID-like format
      const crypto = require('crypto');
      const hash = crypto.createHash('sha1').update(ticketId).digest('hex');
      ticketId = `${hash.substr(0, 8)}-${hash.substr(8, 4)}-${hash.substr(12, 4)}-${hash.substr(16, 4)}-${hash.substr(20, 12)}`;
      console.log('[Disputes API POST] Converted ticket_id to UUID:', body.ticket_id, '->', ticketId);
    }

    // Log for debugging
    console.log('[Disputes API POST] Creating dispute:', {
      user_address: body.user_address,
      ticket_id: body.ticket_id,
      reason: body.reason,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
    });

    // If no Supabase keys, store mock response for development
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[Disputes API POST] No Supabase keys found, using mock store');
      const mockDispute = {
        id: Math.floor(Math.random() * 10000),
        user_address: body.user_address,
        ticket_id: ticketId,
        reason: body.reason,
        description: body.description || '',
        status: 'OPEN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Store in mock store so it can be retrieved
      if (!mockDisputes[body.user_address]) {
        mockDisputes[body.user_address] = [];
      }
      mockDisputes[body.user_address].push(mockDispute);
      
      return NextResponse.json(mockDispute, { status: 201 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create new dispute
    const disputeData = {
      user_address: body.user_address,
      ticket_id: ticketId,
      reason: body.reason,
      description: body.description || null,
      status: 'OPEN',
    };

    console.log('[Disputes API POST] Inserting dispute data:', disputeData);

    const { data: newDispute, error } = await supabase
      .from('disputes')
      .insert([disputeData])
      .select();

    if (error) {
      console.error('[Disputes API POST] Database error:', error);
      console.error('[Disputes API POST] Error details:', {
        code: error.code,
        message: error.message,
        details: (error as any).details,
      });
      throw error;
    }

    console.log('[Disputes API POST] Dispute created successfully:', newDispute?.[0]);
    return NextResponse.json(newDispute?.[0], { status: 201 });
  } catch (error: any) {
    console.error('[Disputes API POST] Catch block error:', error.message || error);
    return NextResponse.json(
      { 
        error: 'Failed to create dispute',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
