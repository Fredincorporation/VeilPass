import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserPreferences } from '@/lib/supabase';

/**
 * Hook to fetch user notification preferences
 */
export function useUserPreferences(walletAddress?: string) {
  return useQuery({
    queryKey: ['userPreferences', walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error('Wallet address required');
      const { data } = await axios.get<UserPreferences>(
        `/api/user/preferences?wallet=${walletAddress}`
      );
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: !!walletAddress,
  });
}

/**
 * Hook to update user notification preferences
 */
export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Partial<UserPreferences> & { wallet_address: string }
    ) => {
      const { data } = await axios.put<UserPreferences>(
        '/api/user/preferences',
        updates
      );
      return data;
    },
    onSuccess: (updatedPrefs) => {
      queryClient.invalidateQueries({
        queryKey: ['userPreferences', updatedPrefs.wallet_address],
      });
      queryClient.setQueryData(
        ['userPreferences', updatedPrefs.wallet_address],
        updatedPrefs
      );
    },
  });
}

/**
 * Toggle a single preference field
 */
export function useTogglePreference() {
  const { mutate: updatePreferences } = useUpdateUserPreferences();

  return (walletAddress: string, field: keyof UserPreferences, currentValue: boolean) => {
    updatePreferences({
      wallet_address: walletAddress,
      [field]: !currentValue,
    } as any);
  };
}
