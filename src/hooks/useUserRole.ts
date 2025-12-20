import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useUserRole(walletAddress?: string) {
  return useQuery({
    queryKey: ['userRole', walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error('Wallet address required');
      const { data } = await axios.get<{ role: string }>(`/api/user?wallet=${encodeURIComponent(walletAddress)}&fields=role`);
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    enabled: !!walletAddress,
  });
}
