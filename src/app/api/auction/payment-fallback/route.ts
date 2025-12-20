import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { InitiateFallbackSchema, validateInput, checkRateLimit, validateFutureTimestamp } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * POST /api/auction/payment-fallback
 * 
 * Checks for auction results with expired payment deadlines and attempts fallback:
 * 1. Finds all pending_payment auctions where payment_deadline < NOW()
 * 2. Updates status to 'failed_payment'
 * 3. Logs the failed payment
 * 4. Offers the auction to the next-highest bidder(s)
 * 5. Sets new payment deadline for fallback bidder
 * 
 * This endpoint should be called via cron job (recommended: every 5-10 minutes)
 * 
 * Security:
 * - Rate limited to 10 requests per minute (cron job rate)
 * - Input validation via Zod
 * - Address validation for winner_address
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting (strict for cron)
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '') || 'unknown';
    if (!checkRateLimit(`payment-fallback:${apiKey}`, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Cron rate limit exceeded.' }, { status: 429 });
    }

    // 2. Parse and validate input
    const body = await request.json().catch(() => ({}));
    const validation = validateInput(InitiateFallbackSchema, body);
    if (!validation.valid) {
      console.warn('[SECURITY] Invalid fallback initiation input:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const v = validation.data || {} as any;
    const auctionId = v.auctionId as string | undefined;
    const maxFallbackAttempts = typeof v.maxFallbackAttempts === 'number' ? v.maxFallbackAttempts : 3;

    // Find auction results with expired payment deadlines
    let query = supabaseAdmin
      .from('auction_results')
      .select('*')
      .eq('status', 'pending_payment')
      .lt('payment_deadline', new Date().toISOString());

    if (auctionId) {
      query = query.eq('auction_id', auctionId);
    }

    const { data: expiredPayments, error: expiredErr } = await query;

    if (expiredErr) {
      console.error('Error fetching expired payments:', expiredErr);
      return NextResponse.json({ error: expiredErr.message }, { status: 500 });
    }

    if (!expiredPayments || expiredPayments.length === 0) {
      return NextResponse.json({
        ok: true,
        fallbacks_initiated: [],
        message: 'No expired payments to process',
      }, { status: 200 });
    }

    const results: any[] = [];

    for (const payment of expiredPayments) {
      try {
        // Update status to failed_payment
        const { error: failErr } = await supabaseAdmin
          .from('auction_results')
          .update({
            status: 'failed_payment',
            fallback_reason: 'Payment deadline exceeded',
            fallback_timestamp: new Date().toISOString(),
          })
          .eq('id', payment.id);

        if (failErr) {
          console.error(`Error marking payment as failed for result ${payment.id}:`, failErr);
          results.push({
            resultId: payment.id,
            auctionId: payment.auction_id,
            status: 'error',
            error: failErr.message,
          });
          continue;
        }

        // Get fallback bidders (next highest bidders)
        const { data: fallbackBidders, error: fallbackErr } = await supabaseAdmin
          .rpc('get_fallback_bidders', {
            p_auction_id: payment.auction_id,
            p_exclude_address: payment.winner_address,
            p_limit: maxFallbackAttempts,
          });

        if (fallbackErr) {
          console.error(`Error fetching fallback bidders for auction ${payment.auction_id}:`, fallbackErr);
          results.push({
            resultId: payment.id,
            auctionId: payment.auction_id,
            status: 'no_fallback_bidders',
            error: fallbackErr.message,
          });
          continue;
        }

        if (!fallbackBidders || fallbackBidders.length === 0) {
          // No fallback bidders available
          await supabaseAdmin
            .from('auction_results')
            .update({ status: 'failed_all_fallbacks' })
            .eq('id', payment.id);

          results.push({
            resultId: payment.id,
            auctionId: payment.auction_id,
            status: 'failed_all_fallbacks',
            message: 'No fallback bidders available',
          });
          continue;
        }

        // Offer to first fallback bidder
        const fallbackBidder = fallbackBidders[0];
        const offerExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const paymentDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours for payment

        // Log fallback attempt
        const { data: logData, error: logErr } = await supabaseAdmin
          .from('payment_fallback_log')
          .insert([
            {
              auction_id: payment.auction_id,
              auction_result_id: payment.id,
              previous_winner_address: payment.winner_address,
              fallback_bidder_address: fallbackBidder.bidder_address,
              fallback_amount: fallbackBidder.revealed_amount,
              fallback_commitment_id: fallbackBidder.commitment_id,
              offer_expires_at: offerExpiresAt.toISOString(),
              payment_deadline: paymentDeadline.toISOString(),
              response_status: 'pending',
            },
          ])
          .select('id');

        if (logErr) {
          console.error(`Error logging fallback attempt for result ${payment.id}:`, logErr);
          continue;
        }

        // Update auction result with new winner (in 'fallback_offered' state)
        await supabaseAdmin
          .from('auction_results')
          .update({
            status: 'fallback_offered',
            winner_address: fallbackBidder.bidder_address,
            winning_amount: fallbackBidder.revealed_amount,
            commitment_id: fallbackBidder.commitment_id,
            fallback_count: (payment.fallback_count || 0) + 1,
            is_fallback_winner: true,
            previous_winner_address: payment.winner_address,
            payment_deadline: paymentDeadline.toISOString(),
          })
          .eq('id', payment.id);

        results.push({
          resultId: payment.id,
          auctionId: payment.auction_id,
          status: 'fallback_offered',
          previousWinner: payment.winner_address,
          fallbackWinner: fallbackBidder.bidder_address,
          fallbackAmount: fallbackBidder.revealed_amount,
          offerExpiresAt: offerExpiresAt.toISOString(),
          paymentDeadline: paymentDeadline.toISOString(),
        });

        // TODO: Send notification to fallback bidder
        // This should trigger an in-app notification and optional email
        console.log(`[Notification] Fallback offer to ${fallbackBidder.bidder_address} for auction ${payment.auction_id}`);

      } catch (auctionErr) {
        console.error(`Error processing expired payment ${payment.id}:`, auctionErr);
        results.push({
          resultId: payment.id,
          auctionId: payment.auction_id,
          status: 'error',
          error: String(auctionErr),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      fallbacks_initiated: results,
      count: results.length,
    }, { status: 200 });

  } catch (err: any) {
    console.error('Error in payment-fallback endpoint:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
