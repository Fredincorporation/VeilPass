import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bid } from '@/lib/supabase';

export function useBids(auctionId?: number) {
  return useQuery({
    queryKey: ['bids', auctionId],
    queryFn: async () => {
      const params = auctionId ? `?auctionId=${auctionId}` : '';
      const { data } = await axios.get<Bid[]>(`/api/bids${params}`);
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    enabled: !!auctionId,
  });
}

export function usePlaceBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bid: Omit<Bid, 'id' | 'created_at'>) => {
      const { data } = await axios.post<Bid>('/api/bids', bid);
      return data;
    },
    onSuccess: (newBid) => {
      queryClient.invalidateQueries({ queryKey: ['bids'] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
  });
}
