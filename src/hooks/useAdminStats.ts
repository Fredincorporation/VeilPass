import { useQuery } from '@tanstack/react-query';

export interface AdminStats {
  totalUsers: number;
  activeSellers: number;
  openDisputes: number;
  totalEvents: number;
  totalTransactions: number;
  platformVolume: string; // ETH amount
}

export function useAdminStats(enabledOrWallet: boolean | string = true) {
  // Support both boolean (for backwards compatibility) and wallet address string
  const enabled = typeof enabledOrWallet === 'boolean' ? enabledOrWallet : !!enabledOrWallet;
  const adminWallet = typeof enabledOrWallet === 'string' ? enabledOrWallet : null;

  return useQuery<AdminStats>({
    queryKey: ['adminStats', adminWallet],
    queryFn: async () => {
      try {
        const url = adminWallet 
          ? `/api/admin/stats?admin_wallet=${encodeURIComponent(adminWallet)}`
          : '/api/admin/stats';
        const response = await fetch(url);
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
    enabled,
  });
}
