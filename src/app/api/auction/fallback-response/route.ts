import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * POST /api/auction/fallback-response
 * 
 * Handles fallback bidder's response to the offer
 * 
 * Request body:
 * {
 *   "auctionResultId": "123",
 *   "fallbackLogId": "456",
 *   "response": "accepted" | "rejected",
 *   "bidderAddress": "0x..."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auctionResultId, fallbackLogId, response, bidderAddress } = body;

    if (!auctionResultId || !fallbackLogId || !response || !bidderAddress) {
      return NextResponse.json({
        error: 'Missing required fields: auctionResultId, fallbackLogId, response, bidderAddress',
      }, { status: 400 });
    }

    if (!['accepted', 'rejected'].includes(response)) {
      return NextResponse.json({ error: 'Response must be "accepted" or "rejected"' }, { status: 400 });
    }

    // Get the auction result
    const { data: result, error: resultErr } = await supabaseAdmin
      .from('auction_results')
      .select('*')
      .eq('id', auctionResultId)
      .single();

    if (resultErr) {
      return NextResponse.json({ error: 'Auction result not found' }, { status: 404 });
    }

    // Verify the bidder is the fallback winner
    if (result.winner_address !== bidderAddress) {
      return NextResponse.json({
        error: 'Bidder address does not match fallback winner',
      }, { status: 403 });
    }

    // Get the fallback log entry
    const { data: fallbackLog, error: logErr } = await supabaseAdmin
      .from('payment_fallback_log')
      .select('*')
      .eq('id', fallbackLogId)
      .eq('auction_result_id', auctionResultId)
      .single();

    if (logErr || !fallbackLog) {
      return NextResponse.json({ error: 'Fallback log entry not found' }, { status: 404 });
    }

    // Check if offer is still valid
    const now = new Date();
    const offerExpires = new Date(fallbackLog.offer_expires_at);
    if (now > offerExpires) {
      // Offer expired - treat as rejection
      await handleRejection(auctionResultId, fallbackLogId, 'expired');
      return NextResponse.json({
        error: 'Fallback offer has expired',
      }, { status: 410 }); // 410 Gone
    }

    if (response === 'accepted') {
      // Update fallback log
      await supabaseAdmin
        .from('payment_fallback_log')
        .update({
          response_status: 'accepted',
          response_timestamp: new Date().toISOString(),
        })
        .eq('id', fallbackLogId);

      // Update auction result to 'fallback_accepted'
      await supabaseAdmin
        .from('auction_results')
        .update({
          status: 'fallback_accepted',
        })
        .eq('id', auctionResultId);

      return NextResponse.json({
        ok: true,
        message: 'Fallback offer accepted',
        result: {
          auctionResultId,
          status: 'fallback_accepted',
          paymentDeadline: result.payment_deadline,
          winnerAddress: bidderAddress,
          amount: result.winning_amount,
        },
      }, { status: 200 });

    } else {
      // Rejection
      await handleRejection(auctionResultId, fallbackLogId, 'rejected');

      return NextResponse.json({
        ok: true,
        message: 'Fallback offer rejected',
        result: {
          auctionResultId,
          status: 'fallback_rejected',
        },
      }, { status: 200 });
    }

  } catch (err: any) {
    console.error('Error in fallback-response endpoint:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

/**
 * Helper function to handle rejection and try next bidder
 */
async function handleRejection(
  auctionResultId: number,
  fallbackLogId: number,
  reason: 'rejected' | 'expired'
) {
  try {
    // Get the current auction result
    const { data: result, error: resultErr } = await supabaseAdmin
      .from('auction_results')
      .select('*')
      .eq('id', auctionResultId)
      .single();

    if (resultErr) {
      console.error('Error fetching auction result for rejection handling:', resultErr);
      return;
    }

    // Update the fallback log
    await supabaseAdmin
      .from('payment_fallback_log')
      .update({
        response_status: reason,
        response_timestamp: new Date().toISOString(),
        final_status: reason === 'expired' ? 'expired' : 'rejected',
      })
      .eq('id', fallbackLogId);

    // Check if we've exceeded max fallback attempts
    const maxAttempts = 3;
    if ((result.fallback_count || 0) >= maxAttempts) {
      // Mark as failed - no more fallback attempts
      await supabaseAdmin
        .from('auction_results')
        .update({
          status: 'failed_all_fallbacks',
          fallback_reason: `All ${maxAttempts} fallback attempts exhausted`,
        })
        .eq('id', auctionResultId);

      console.log(`[Fallback] Auction result ${auctionResultId}: All fallback attempts exhausted`);
      return;
    }

    // Try to offer to next highest bidder
    const { data: fallbackBidders, error: fallbackErr } = await supabaseAdmin
      .rpc('get_fallback_bidders', {
        p_auction_id: result.auction_id,
        p_exclude_address: result.previous_winner_address || result.winner_address,
        p_limit: 1,
      });

    if (fallbackErr || !fallbackBidders || fallbackBidders.length === 0) {
      console.warn(`[Fallback] No more fallback bidders for auction ${result.auction_id}`);
      await supabaseAdmin
        .from('auction_results')
        .update({
          status: 'failed_all_fallbacks',
          fallback_reason: 'No more fallback bidders available',
        })
        .eq('id', auctionResultId);
      return;
    }

    // Offer to next bidder
    const nextBidder = fallbackBidders[0];
    const offerExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const paymentDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Log the new fallback attempt
    await supabaseAdmin
      .from('payment_fallback_log')
      .insert([
        {
          auction_id: result.auction_id,
          auction_result_id: auctionResultId,
          previous_winner_address: result.winner_address,
          fallback_bidder_address: nextBidder.bidder_address,
          fallback_amount: nextBidder.revealed_amount,
          fallback_commitment_id: nextBidder.commitment_id,
          offer_expires_at: offerExpiresAt.toISOString(),
          payment_deadline: paymentDeadline.toISOString(),
          response_status: 'pending',
        },
      ]);

    // Update auction result
    await supabaseAdmin
      .from('auction_results')
      .update({
        winner_address: nextBidder.bidder_address,
        winning_amount: nextBidder.revealed_amount,
        commitment_id: nextBidder.commitment_id,
        fallback_count: (result.fallback_count || 0) + 1,
        status: 'fallback_offered',
        payment_deadline: paymentDeadline.toISOString(),
      })
      .eq('id', auctionResultId);

    console.log(`[Fallback] Auction result ${auctionResultId}: Offered to next bidder ${nextBidder.bidder_address}`);

  } catch (err) {
    console.error('Error in handleRejection:', err);
  }
}
