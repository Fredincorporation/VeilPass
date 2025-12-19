import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await request.json();
    const disputeId = params.id;

    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Update dispute status
    const { data: updatedDispute, error } = await supabase
      .from('disputes')
      .update({
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', disputeId)
      .select();

    if (error) throw error;

    if (!updatedDispute || updatedDispute.length === 0) {
      return NextResponse.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDispute[0]);
  } catch (error) {
    console.error('Error updating dispute:', error);
    return NextResponse.json(
      { error: 'Failed to update dispute' },
      { status: 500 }
    );
  }
}
