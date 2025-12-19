import { useQuery } from '@tanstack/react-query';

export interface AdminStats {
  totalUsers: number;
  activeSellers: number;
  openDisputes: number;
  totalEvents: number;
  totalTransactions: number;
  platformVolume: string; // ETH amount
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/stats');
        console.log('Admin stats response status:', response.status);
        if (!response.ok) {
          console.error('Admin stats API error:', response.status);
          throw new Error('Failed to fetch admin stats');
        }
        const data = await response.json();
        console.log('Admin stats data:', data);
        return data;
      } catch (error) {
        console.error('Admin stats fetch error:', error);
        throw error;
      }
    },
  });
}
