import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { User } from '@/lib/supabase';

/**
 * Hook to fetch user profile including business_name, theme, and language preferences
 */
export function useUserProfile(walletAddress?: string) {
  return useQuery({
    queryKey: ['userProfile', walletAddress],
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

/**
 * Hook to update user profile fields (business_name, theme_preference, language_preference)
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<User> & { wallet_address: string }) => {
      const { data } = await axios.put<User>('/api/user', updates);
      return data;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', updatedUser.wallet_address] });
      queryClient.invalidateQueries({ queryKey: ['user', updatedUser.wallet_address] });
      queryClient.setQueryData(['userProfile', updatedUser.wallet_address], updatedUser);
      queryClient.setQueryData(['user', updatedUser.wallet_address], updatedUser);
    },
  });
}

/**
 * Update specific user profile field
 */
export function useUpdateUserField() {
  const { mutate: updateProfile } = useUpdateUserProfile();

  return (walletAddress: string, field: keyof User, value: any) => {
    updateProfile({
      wallet_address: walletAddress,
      [field]: value,
    });
  };
}
