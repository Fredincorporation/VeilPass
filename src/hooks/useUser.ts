import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { User } from '@/lib/supabase';

export function useUser(walletAddress?: string) {
  return useQuery({
    queryKey: ['user', walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error('Wallet address required');
      const { data } = await axios.get<User>(`/api/user?wallet=${walletAddress}`);
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!walletAddress,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<User> & { wallet_address: string }) => {
      const { data } = await axios.put<User>('/api/user', updates);
      return data;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user', updatedUser.wallet_address] });
      queryClient.setQueryData(['user', updatedUser.wallet_address], updatedUser);
    },
  });
}
