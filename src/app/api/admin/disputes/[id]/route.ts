import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Dispute ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, resolution } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    console.log(`Updating dispute ${id} to status: ${status}`);

    // Update the dispute status in database
    const { data, error } = await supabase
      .from('disputes')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(id))
      .select();

    if (error) {
      console.error('Error updating dispute:', error);
      return NextResponse.json(
        { error: 'Failed to update dispute', details: error.message },
        { status: 500 }
      );
    }

    console.log(`Successfully updated dispute ${id}:`, data);

    return NextResponse.json(
      { 
        message: 'Dispute updated successfully', 
        status,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in dispute update:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
