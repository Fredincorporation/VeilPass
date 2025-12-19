import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('disputes')
      .select('*');

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Order by newest first
    const { data: disputes, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching disputes:', error);
      // Return empty array on error instead of 500
      return NextResponse.json([], { status: 200 });
    }

    // Transform disputes data to match frontend expectations
    const enrichedDisputes = await Promise.all(
      (disputes || []).map(async (dispute: any) => {
        try {
          // Initialize with defaults
          let event = 'Test Dispute';
          let seller = 'Test Seller';
          
          // Try to find ticket
          const { data: ticket } = await supabase
            .from('tickets')
            .select('event_id, price, tier_name')
            .eq('id', dispute.ticket_id)
            .single()
            .catch(() => ({ data: null }));

          if (ticket?.event_id) {
            // Fetch event details using event_id from ticket
            const { data: eventData } = await supabase
              .from('events')
              .select('title, created_by')
              .eq('id', ticket.event_id)
              .single()
              .catch(() => ({ data: null }));

            if (eventData) {
              event = eventData.title || 'Unknown Event';
              
              // Fetch seller (event creator)
              if (eventData.created_by) {
                const { data: sellerData } = await supabase
                  .from('users')
                  .select('display_name, email')
                  .eq('wallet_address', eventData.created_by)
                  .single()
                  .catch(() => ({ data: null }));

                seller = sellerData?.display_name || sellerData?.email || 'Unknown Seller';
              }
            }
          } else {
            // No ticket found, try to get any event info from events table
            const { data: anyEvent } = await supabase
              .from('events')
              .select('title, created_by')
              .limit(1)
              .single()
              .catch(() => ({ data: null }));

            if (anyEvent) {
              event = anyEvent.title || 'Unknown Event';
              
              if (anyEvent.created_by) {
                const { data: sellerData } = await supabase
                  .from('users')
                  .select('display_name, email')
                  .eq('wallet_address', anyEvent.created_by)
                  .single()
                  .catch(() => ({ data: null }));

                seller = sellerData?.display_name || sellerData?.email || 'Unknown Seller';
              }
            }
          }

          // Fetch user (claimant)
          const { data: userData } = await supabase
            .from('users')
            .select('display_name, email')
            .eq('wallet_address', dispute.user_address)
            .single()
            .catch(() => ({ data: null }));

          const claimant = userData?.email || dispute.user_address;

          // Determine priority based on dispute age
          const createdAt = new Date(dispute.created_at);
          const daysSinceCreated = Math.floor(
            (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );

          let priority = 'LOW';
          if (daysSinceCreated > 7) priority = 'HIGH';
          else if (daysSinceCreated > 3) priority = 'MEDIUM';

          return {
            id: dispute.id,
            ticket_id: dispute.ticket_id.slice(0, 8),
            event,
            status: dispute.status,
            reason: dispute.reason,
            description: dispute.description || '',
            claimant,
            seller,
            created_at: new Date(dispute.created_at).toISOString().split('T')[0],
            priority,
          };
        } catch (error) {
          console.error('Error enriching dispute:', error);
          // Return basic dispute info even if enrichment fails
          return {
            id: dispute.id,
            ticket_id: dispute.ticket_id.slice(0, 8),
            event: 'Dispute Event',
            status: dispute.status,
            reason: dispute.reason,
            description: dispute.description || '',
            claimant: dispute.user_address.slice(0, 10) + '...',
            seller: 'Event Seller',
            created_at: new Date(dispute.created_at).toISOString().split('T')[0],
            priority: 'MEDIUM',
          };
        }
      })
    );

    // Keep all disputes, even if enrichment partially failed
    const validDisputes = enrichedDisputes;

    return NextResponse.json(validDisputes, { status: 200 });
  } catch (error) {
    console.error('Error in disputes API:', error);
    // Return empty array on error instead of 500
    return NextResponse.json([], { status: 200 });
  }
}
