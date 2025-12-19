import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/admin/settings
 * Fetch platform settings (admin only)
 */
export async function GET(request: Request) {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      // If no settings exist, create defaults
      if (error.code === 'PGRST116') {
        const { data: newSettings, error: createError } = await supabase
          .from('platform_settings')
          .insert({
            platform_name: 'VeilPass',
            platform_version: '1.0.0',
            maintenance_mode: false,
            platform_fee_percentage: 2.5,
            minimum_ticket_price: 0.05,
            maximum_ticket_price: 1000,
            payout_threshold: 100,
            enable_two_factor: true,
            max_login_attempts: 5,
            session_timeout: 30,
            require_kyc: true,
            enable_auctions: true,
            enable_disputes: true,
            enable_loyalty: true,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating platform settings:', createError);
          return NextResponse.json(
            { error: 'Failed to create settings' },
            { status: 500 }
          );
        }

        return NextResponse.json(newSettings);
      }

      console.error('Error fetching settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Update platform settings (admin only)
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('platform_settings')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
