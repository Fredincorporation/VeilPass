import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface CustomerStats {
  activeTickets: number;
  totalSpent: {
    eth: string;
    usd: string;
  };
}

export function useCustomerStats(walletAddress: string | null) {
  return useQuery<CustomerStats>({
    queryKey: ['customerStats', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        return { activeTickets: 0, totalSpent: { eth: '0.0000 ETH', usd: '$0.00' } };
      }

      try {
        const response = await axios.get(`/api/user/stats`, {
          params: { address: walletAddress }
        });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch customer stats:', error);
        return { activeTickets: 0, totalSpent: { eth: '0.0000 ETH', usd: '$0.00' } };
      }
    },
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
