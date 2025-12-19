import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface RedeemableItem {
  id: number;
  title: string;
  points: number;
  description: string;
}

/**
 * Fetch redeemable items (loyalty rewards)
 */
export function useRedeemableItems() {
  return useQuery({
    queryKey: ['redeemableItems'],
    queryFn: async () => {
      const { data } = await axios.get<RedeemableItem[]>('/api/loyalty/redeemables');
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Redeem loyalty points for a reward
 */
export function useRedeemPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { userAddress: string; redeemableId: number; pointsUsed: number }) => {
      const { data } = await axios.post('/api/loyalty/redeem', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userAddress] });
      queryClient.invalidateQueries({ queryKey: ['redeemableItems'] });
    },
  });
}

/**
 * Fetch redemption history
 */
export function useRedemptionHistory(userAddress: string) {
  return useQuery({
    queryKey: ['redemptionHistory', userAddress],
    queryFn: async () => {
      if (!userAddress) return [];
      const { data } = await axios.get(`/api/loyalty/history?user=${userAddress}`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!userAddress,
  });
}
