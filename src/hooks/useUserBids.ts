import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface UserBid {
  id: number;
  auction_id: number;
  bidder_address: string;
  amount: number;
  encrypted: boolean;
  created_at: string;
  // Joined data from auctions table
  ticket_id: string;
  seller_address: string;
  start_bid: number;
  listing_price: number;
  reserve_price?: number;
  duration_hours: number;
  end_time: string;
  auction_status: string;
  created_at_auction: string;
}

/**
 * Fetch all bids placed by a specific user
 */
export function useUserBids(userAddress: string) {
  return useQuery({
    queryKey: ['userBids', userAddress],
    queryFn: async () => {
      if (!userAddress) return [];
      const { data } = await axios.get<UserBid[]>(`/api/bids?bidder=${userAddress}`);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (frequent updates for active auctions)
    enabled: !!userAddress,
  });
}

/**
 * Fetch active bids (auctions that haven't ended yet)
 */
export function useActiveBids(userAddress: string) {
  const { data: allBids = [], ...rest } = useUserBids(userAddress);

  const activeBids = allBids.filter((bid) => {
    const endTime = new Date(bid.end_time).getTime();
    const now = new Date().getTime();
    return endTime > now && bid.auction_status === 'active';
  });

  return {
    data: activeBids,
    ...rest,
  };
}

/**
 * Get highest bid for a specific auction
 */
export function getHighestBid(bids: UserBid[], auctionId: number): UserBid | null {
  const auctionBids = bids.filter((b) => b.auction_id === auctionId);
  if (auctionBids.length === 0) return null;
  return auctionBids.reduce((max, bid) => (bid.amount > max.amount ? bid : max));
}

/**
 * Check if user is winning an auction
 */
export function isUserWinning(userAddress: string, allBids: UserBid[], auctionId: number): boolean {
  const highestBid = getHighestBid(allBids, auctionId);
  return highestBid?.bidder_address === userAddress;
}
