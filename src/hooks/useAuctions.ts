import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Auction } from '@/lib/supabase';

export function useAuctions(status?: string) {
  return useQuery({
    queryKey: ['auctions', status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : '';
      const { data } = await axios.get<Auction[]>(`/api/auctions${params}`);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for active auctions)
    refetchOnWindowFocus: false,
  });
}

export function useCreateAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (auction: Omit<Auction, 'id' | 'created_at'>) => {
      const { data } = await axios.post<Auction>('/api/auctions', auction);
      return data;
    },
    onSuccess: (newAuction) => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      queryClient.setQueryData(['auction', newAuction.id], newAuction);
    },
  });
}
