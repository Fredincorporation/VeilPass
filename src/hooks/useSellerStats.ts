import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface SellerStats {
  eventsCreated: number;
  ticketsSold: number;
  totalRevenue: string;
}

export function useSellerStats(sellerAddress: string | null) {
  return useQuery<SellerStats>({
    queryKey: ['sellerStats', sellerAddress],
    queryFn: async () => {
      if (!sellerAddress) {
        return { eventsCreated: 0, ticketsSold: 0, totalRevenue: '0' };
      }

      try {
        const response = await axios.get(`/api/seller/stats`, {
          params: { address: sellerAddress }
        });
        return response.data;
      } catch (error) {
        console.error('Failed to fetch seller stats:', error);
        return { eventsCreated: 0, ticketsSold: 0, totalRevenue: '0' };
      }
    },
    enabled: !!sellerAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
