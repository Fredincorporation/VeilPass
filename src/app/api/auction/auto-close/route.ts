import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * POST /api/auction/auto-close
 * 
 * Closes all auctions that have passed their cutoff_time (5 hours before event start).
 * Settles the highest revealed bids and marks auctions as 'closed'.
 * This endpoint should be called via cron job to enforce pre-event closure.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { auctionId } = body || {};

    // Find auctions past their cutoff_time that are still active
    let auctionsQuery = supabaseAdmin
      .from('auctions')
      .select('id, ticket_id, cutoff_time, status')
      .eq('status', 'active')
      .lt('cutoff_time', new Date().toISOString());

    if (auctionId) auctionsQuery = auctionsQuery.eq('id', auctionId);

    const { data: auctionsData, error: auctionsErr } = await auctionsQuery;

    if (auctionsErr) {
      console.error('Error fetching auctions to close:', auctionsErr);
      return NextResponse.json({ error: auctionsErr.message }, { status: 500 });
    }

    if (!auctionsData || auctionsData.length === 0) {
      return NextResponse.json({ ok: true, closed: [], message: 'No auctions to close' }, { status: 200 });
    }

    const results: any[] = [];

    for (const auction of auctionsData) {
      try {
        // Get all revealed bids for this auction
        const { data: bids, error: bidsErr } = await supabaseAdmin
          .from('auction_commitments')
          .select('*')
          .eq('auction_id', auction.id)
          .eq('revealed', true)
          .order('revealed_amount', { ascending: false });

        if (bidsErr) {
          console.error(`Error fetching bids for auction ${auction.id}:`, bidsErr);
          continue;
        }

        // If there are revealed bids, record the highest as the winner
        if (bids && bids.length > 0) {
          const winner = bids[0];

          // Check if auction_results already exists
          const { data: existingResult } = await supabaseAdmin
            .from('auction_results')
            .select('id')
            .eq('auction_id', auction.id)
            .limit(1);

          if (!existingResult || existingResult.length === 0) {
            // Insert settlement result
            await supabaseAdmin
              .from('auction_results')
              .insert([
                {
                  auction_id: auction.id,
                  winner_address: winner.bidder_address,
                  winning_amount: winner.revealed_amount,
                  commitment_id: winner.id,
                  status: 'pending_payment',
                  payment_deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                },
              ]);

            results.push({
              auctionId: auction.id,
              status: 'closed_with_winner',
              winner: winner.bidder_address,
              amount: winner.revealed_amount,
            });
          }
        } else {
          results.push({
            auctionId: auction.id,
            status: 'closed_no_bids',
          });
        }

        // Mark auction as closed
        await supabaseAdmin
          .from('auctions')
          .update({ status: 'closed' })
          .eq('id', auction.id);

      } catch (auctionErr) {
        console.error(`Error processing auction ${auction.id}:`, auctionErr);
        results.push({
          auctionId: auction.id,
          status: 'error',
          error: String(auctionErr),
        });
      }
    }

    return NextResponse.json({ ok: true, closed: results }, { status: 200 });
  } catch (err: any) {
    console.error('Error in auto-close endpoint:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
