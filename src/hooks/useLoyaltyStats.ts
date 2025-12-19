import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface LoyaltyStats {
  pointsEarnedThisMonth: number;
  referralCount: number;
  currentTier: string;
  tierProgress: {
    current: number;
    required: number;
    percentage: number;
  };
}

/**
 * Fetch loyalty dashboard statistics
 */
export function useLoyaltyStats(userAddress: string | null) {
  return useQuery<LoyaltyStats>({
    queryKey: ['loyaltyStats', userAddress],
    queryFn: async () => {
      if (!userAddress) {
        return {
          pointsEarnedThisMonth: 0,
          referralCount: 0,
          currentTier: 'Silver',
          tierProgress: { current: 0, required: 1000, percentage: 0 },
        };
      }

      try {
        const { data } = await axios.get(`/api/loyalty/stats`, {
          params: { address: userAddress }
        });
        return data;
      } catch (error) {
        console.error('Failed to fetch loyalty stats:', error);
        return {
          pointsEarnedThisMonth: 0,
          referralCount: 0,
          currentTier: 'Silver',
          tierProgress: { current: 0, required: 1000, percentage: 0 },
        };
      }
    },
    enabled: !!userAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
