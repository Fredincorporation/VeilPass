/**
 * Client-side utilities for bid validation via Supabase RPC
 */

import { supabase } from '@/lib/supabase';

export interface BidValidationResult {
  isValid: boolean;
  currentHighest: number | null;
  minimumRequired: number | null;
  status: string | null;
  errorMessage: string | null;
}

interface ValidateBidAgainstAuctionResult {
  is_valid: boolean;
  current_highest: number | null;
  minimum_required: number | null;
  status: string | null;
  error_message: string | null;
}

interface GetAuctionBidStateResult {
  highest_bid: number | null;
  bid_count: number;
  bidder_address: string | null;
}

/**
 * Validate a proposed bid against the current auction state (read-only, non-blocking)
 * This can be called before placing a bid to provide immediate user feedback
 * @param auctionId Auction ID
 * @param proposedBid Proposed bid amount in ETH
 * @returns Validation result with current state and error details
 */
export async function validateBidAgainstAuction(
  auctionId: number,
  proposedBid: number
): Promise<BidValidationResult> {
  try {
    const { data, error } = await supabase
      .rpc('validate_bid_against_auction', {
        p_auction_id: auctionId,
        p_proposed_bid: proposedBid,
      })
      .single<ValidateBidAgainstAuctionResult>();

    if (error) {
      console.error('RPC validation error:', error);
      return {
        isValid: false,
        currentHighest: null,
        minimumRequired: null,
        status: null,
        errorMessage: `Validation error: ${error.message}`,
      };
    }

    return {
      isValid: data?.is_valid ?? false,
      currentHighest: data?.current_highest ?? null,
      minimumRequired: data?.minimum_required ?? null,
      status: data?.status ?? null,
      errorMessage: data?.error_message ?? null,
    };
  } catch (err: any) {
    console.error('Unexpected error during bid validation:', err);
    return {
      isValid: false,
      currentHighest: null,
      minimumRequired: null,
      status: null,
      errorMessage: `Unexpected error: ${err?.message || 'Unknown error'}`,
    };
  }
}

/**
 * Get current auction bid state without validation
 * @param auctionId Auction ID
 * @returns Current highest bid, bid count, and leading bidder
 */
export async function getAuctionBidState(auctionId: number) {
  try {
    const { data, error } = await supabase
      .rpc('get_auction_highest_bid', {
        p_auction_id: auctionId,
      })
      .single<GetAuctionBidStateResult>();

    if (error) {
      console.error('Error fetching bid state:', error);
      return {
        highestBid: null,
        bidCount: 0,
        bidderAddress: null,
        error: error.message,
      };
    }

    return {
      highestBid: data?.highest_bid ?? null,
      bidCount: data?.bid_count ?? 0,
      bidderAddress: data?.bidder_address ?? null,
      error: null,
    };
  } catch (err: any) {
    console.error('Unexpected error fetching bid state:', err);
    return {
      highestBid: null,
      bidCount: 0,
      bidderAddress: null,
      error: err?.message || 'Unknown error',
    };
  }
}
