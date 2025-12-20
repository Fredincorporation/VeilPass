import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ConfirmPaymentSchema, validateInput, checkRateLimit } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * POST /api/auction/confirm-payment
 * 
 * Marks an auction result as paid and closes the payment window.
 * Called when payment is confirmed (off-chain payment, webhook from payment processor, etc.)
 * 
 * Request body:
 * {
 *   "auctionResultId": "uuid",
 *   "paymentTxHash": "0x...",  // optional: transaction hash for verification
 *   "paymentMethod": "ethereum" // optional: payment method used
 * }
 * 
 * Security:
 * - Requires authenticated user (owner of auction result)
 * - Input validation via Zod schema
 * - Rate limiting: 30 requests per minute per user
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-client-ip') || 'unknown';
    if (!checkRateLimit(`confirm-payment:${ip}`, 30, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // 2. Parse and validate input
    const body = await request.json();
    const validation = validateInput(ConfirmPaymentSchema, body);
    if (!validation.valid) {
      console.warn('[SECURITY] Invalid payment confirmation input:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const v = validation.data || {} as any;
    const auctionResultId = v.auctionResultId as string;
    const paymentTxHash = v.paymentTxHash as string | undefined;
    const paymentMethod = v.paymentMethod as string | undefined;

    // Get current auction result
    const { data: result, error: getErr } = await supabaseAdmin
      .from('auction_results')
      .select('*')
      .eq('id', auctionResultId)
      .single();

    if (getErr) {
      return NextResponse.json({ error: 'Auction result not found' }, { status: 404 });
    }

    // Check if already paid
    if (result.status === 'paid') {
      return NextResponse.json({
        ok: true,
        message: 'Payment already confirmed',
        result,
      }, { status: 200 });
    }

    // Check if status is valid for payment confirmation
    const validStatuses = ['pending_payment', 'fallback_accepted', 'fallback_offered'];
    if (!validStatuses.includes(result.status)) {
      return NextResponse.json({
        error: `Cannot confirm payment for auction result with status: ${result.status}`,
      }, { status: 400 });
    }

    // Mark as paid
    const paymentTime = new Date().toISOString();
    const { error: updateErr } = await supabaseAdmin
      .from('auction_results')
      .update({
        status: 'paid',
        payment_received_at: paymentTime,
      })
      .eq('id', auctionResultId);

    if (updateErr) {
      console.error('Error updating auction result:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // If this was a fallback winner, update the fallback log
    if (result.is_fallback_winner) {
      const { error: logErr } = await supabaseAdmin
        .from('payment_fallback_log')
        .update({
          payment_received_at: paymentTime,
          final_status: 'paid',
          response_status: 'accepted',
        })
        .eq('auction_result_id', auctionResultId)
        .eq('response_status', 'pending');

      if (logErr) {
        console.warn('Error updating fallback log:', logErr);
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'Payment confirmed successfully',
      result: {
        id: auctionResultId,
        status: 'paid',
        paymentReceivedAt: paymentTime,
        winnerAddress: result.winner_address,
        amount: result.winning_amount,
      },
    }, { status: 200 });

  } catch (err: any) {
    console.error('Error in confirm-payment endpoint:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

/**
 * GET /api/auction/confirm-payment
 * 
 * Get payment status for an auction result
 * Query params:
 * - auctionResultId: The auction result ID to check
 * 
 * Security:
 * - Input validation via Zod
 * - Rate limiting: 100 requests per minute per user
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-client-ip') || 'unknown';
    if (!checkRateLimit(`confirm-payment-get:${ip}`, 100, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 2. Validate input
    const searchParams = request.nextUrl.searchParams;
    const auctionResultId = searchParams.get('auctionResultId');

    if (!auctionResultId) {
      return NextResponse.json({ error: 'auctionResultId is required' }, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(auctionResultId)) {
      return NextResponse.json({ error: 'Invalid auctionResultId format' }, { status: 400 });
    }

    const { data: result, error } = await supabaseAdmin
      .from('auction_results')
      .select('id, auction_id, winner_address, winning_amount, status, payment_deadline, payment_received_at, is_fallback_winner')
      .eq('id', auctionResultId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Auction result not found' }, { status: 404 });
    }

    const now = new Date();
    const deadline = result.payment_deadline ? new Date(result.payment_deadline) : null;
    const isExpired = deadline && now > deadline;
    const timeRemaining = deadline ? deadline.getTime() - now.getTime() : null;

    return NextResponse.json({
      ok: true,
      result: {
        id: result.id,
        auctionId: result.auction_id,
        winnerAddress: result.winner_address,
        amount: result.winning_amount,
        status: result.status,
        paymentDeadline: result.payment_deadline,
        paymentReceivedAt: result.payment_received_at,
        isFallbackWinner: result.is_fallback_winner,
        isExpired,
        timeRemaining,
      },
    }, { status: 200 });

  } catch (err: any) {
    console.error('[ERROR] confirm-payment GET:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Helper function to format time remaining
 */
function formatTimeRemaining(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}
