import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/preferences?wallet=0x...
 * Fetch user notification preferences
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('wallet_address', wallet)
      .single();

    if (error) {
      // If no preferences exist, create default ones
      if (error.code === 'PGRST116') {
        const { data: newPrefs, error: createError } = await supabase
          .from('user_preferences')
          .insert({
            wallet_address: wallet,
            event_reminders: true,
            promotions: true,
            reviews: true,
            auctions: true,
            disputes: true,
            newsletter: false,
            news_and_updates: true,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating preferences:', createError);
          return NextResponse.json(
            { error: 'Failed to create preferences' },
            { status: 500 }
          );
        }

        return NextResponse.json(newPrefs);
      }

      console.error('Error fetching preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Preferences GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/preferences
 * Update user notification preferences
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { wallet_address, ...updates } = body;

    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', wallet_address)
      .select()
      .single();

    if (error) {
      console.error('Error updating preferences:', error);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Preferences PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
