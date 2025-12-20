import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { fetchEthPrice } from '@/lib/currency-utils';
import { verifyBidSignature, BidSignaturePayload } from '@/lib/bidSignature';
import { getMinimumNextBid, validateBidIncrement } from '@/lib/bidConfig';

// Type for RPC validate_and_place_bid response
interface BidValidationRpcResult {
  success: boolean;
  bid_id: number | null;
  highest_bid: number;
  bid_count: number;
  minimum_required: number | null;
  error: string | null;
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const auctionId = request.nextUrl.searchParams.get('auctionId');
    const bidder = request.nextUrl.searchParams.get('bidder');
    
    let query = supabase
      .from('bids')
      .select(`
        id,
        auction_id,
        bidder_address,
        amount,
        encrypted,
        created_at,
        auctions (
          id,
          ticket_id,
          seller_address,
          start_bid,
          listing_price,
          reserve_price,
          duration_hours,
          end_time,
          status,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (auctionId) {
      query = query.eq('auction_id', auctionId);
    }

    if (bidder) {
      query = query.eq('bidder_address', bidder);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform the data to flatten auction info
    const transformedData = (data || []).map((bid: any) => ({
      id: bid.id,
      auction_id: bid.auction_id,
      bidder_address: bid.bidder_address,
      amount: bid.amount,
      encrypted: bid.encrypted,
      created_at: bid.created_at,
      // Flattened auction data
      ticket_id: bid.auctions?.ticket_id,
      seller_address: bid.auctions?.seller_address,
      start_bid: bid.auctions?.start_bid,
      listing_price: bid.auctions?.listing_price,
      reserve_price: bid.auctions?.reserve_price,
      duration_hours: bid.auctions?.duration_hours,
      end_time: bid.auctions?.end_time,
      auction_status: bid.auctions?.status,
      created_at_auction: bid.auctions?.created_at,
    }));

    return NextResponse.json(transformedData);
  } catch (error: any) {
    console.error('Error fetching bids:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.auction_id || !body.bidder_address || body.amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: auction_id, bidder_address, amount' },
        { status: 400 }
      );
    }

    // Verify the bid signature before processing
    const signature = body.signature;
    if (!signature) {
      return NextResponse.json(
        { error: 'Bid signature required for verification' },
        { status: 400 }
      );
    }

    const bidSignatureData: BidSignaturePayload = {
      auction_id: body.auction_id,
      bidder_address: body.bidder_address,
      amount: body.amount,
      amount_usd: body.amount_usd,
      encrypted: body.encrypted ?? true,
      timestamp: body.timestamp ?? Math.floor(Date.now() / 1000),
    };

    const isSignatureValid = verifyBidSignature(bidSignatureData, signature);
    if (!isSignatureValid) {
      console.warn(`Invalid bid signature from ${body.bidder_address} for auction ${body.auction_id}`);
      return NextResponse.json(
        { error: 'Bid signature verification failed' },
        { status: 401 }
      );
    }

    // If the client sent an ETH amount but didn't include a USD snapshot,
    // compute amount_usd server-side to preserve a price snapshot.
    const ethPrice = await fetchEthPrice();
    const amountUsd = body.amount_usd ?? (body.amount !== undefined ? Number((Number(body.amount) * ethPrice).toFixed(2)) : undefined);

    // ============================================================================
    // Use atomic RPC function for bid validation and insertion
    // This prevents race conditions where two bids might try to place simultaneously
    // ============================================================================
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('validate_and_place_bid', {
        p_auction_id: body.auction_id,
        p_bidder_address: body.bidder_address,
        p_bid_amount: Number(body.amount),
        p_amount_usd: amountUsd,
        p_encrypted: body.encrypted ?? true,
      })
      .single<BidValidationRpcResult>();

    if (rpcError) {
      console.error('RPC error during bid validation:', rpcError);
      return NextResponse.json(
        { error: 'Database error during bid placement', details: rpcError.message },
        { status: 500 }
      );
    }

    // Check if RPC returned validation failure
    if (!rpcResult?.success) {
      console.warn(`Bid validation failed for ${body.bidder_address}:`, rpcResult?.error);
      return NextResponse.json(
        {
          error: rpcResult?.error || 'Bid validation failed',
          currentHighest: rpcResult?.highest_bid,
          minimumRequired: rpcResult?.minimum_required,
          bidCount: rpcResult?.bid_count,
        },
        { status: 400 }
      );
    }

    // RPC function placed the bid successfully - fetch the full record
    const { data: newBidData, error: selectError } = await supabase
      .from('bids')
      .select('*')
      .eq('id', rpcResult.bid_id)
      .single();

    if (selectError || !newBidData) {
      console.error('Error fetching newly created bid:', selectError);
      return NextResponse.json(
        { error: 'Bid was placed but could not be retrieved' },
        { status: 500 }
      );
    }

    const newBid = newBidData;

    // Notify admins about high-value bids
    try {
      if (body.amount && parseFloat(body.amount) > 1000) { // Notify for bids over 1000
        const { data: admins } = await supabaseAdmin
          .from('users')
          .select('wallet_address')
          .eq('role', 'admin');

        if (admins && admins.length > 0) {
          const adminNotifications = admins.map(admin => ({
            user_address: admin.wallet_address,
            type: 'high_value_bid',
            title: 'High Value Bid Placed',
            message: `A high-value bid of ${body.amount} has been placed in auction #${body.auction_id}`,
          }));
          await supabaseAdmin.from('notifications').insert(adminNotifications);
        }
      }

      // Notify previous bidders if they've been outbid
      if (body.previous_bid_id) {
        const { data: previousBid } = await supabase
          .from('bids')
          .select('bidder_address')
          .eq('id', body.previous_bid_id)
          .single();

        if (previousBid) {
          await supabaseAdmin.from('notifications').insert({
            user_address: previousBid.bidder_address,
            type: 'outbid',
            title: 'You Have Been Outbid',
            message: `Your bid in auction #${body.auction_id} has been outbid. New leading bid: ${body.amount}`,
          });
        }
      }
    } catch (notificationError) {
      console.error('Error creating bid notifications:', notificationError);
      // Don't fail the request if notifications fail
    }

    return NextResponse.json(newBid, { status: 201 });
  } catch (error: any) {
    console.error('Error placing bid:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
