import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface RevenueBreakdown {
  eventId: number;
  ticketsSold: number;
  unitPrice: number;
  revenue: string;
  avgPrice?: string;
}

export interface RevenueData {
  totalRevenue: string;
  totalTickets: number;
  breakdown: RevenueBreakdown[];
}

/**
 * Fetch revenue for a seller based on actual ticket sales
 */
export function useSellerRevenue(sellerAddress: string | null) {
  return useQuery({
    queryKey: ['sellerRevenue', sellerAddress],
    queryFn: async () => {
      if (!sellerAddress) return null;
      const { data } = await axios.get<RevenueData>(
        `/api/seller/events/revenue?seller=${sellerAddress}`
      );
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!sellerAddress,
  });
}
