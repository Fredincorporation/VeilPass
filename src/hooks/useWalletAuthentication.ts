import { useEffect } from 'react';
import { useUser, useUpdateUser } from './useUser';
import { useToast } from '@/components/ToastContainer';

export function useWalletAuthentication(walletAddress: string | null) {
  const { showError } = useToast();
  const { data: user, isLoading, error } = useUser(walletAddress || undefined);
  const updateUserMutation = useUpdateUser();

  useEffect(() => {
    if (error) {
      console.error('User authentication error:', error);
      showError('Failed to load user profile');
    }
  }, [error, showError]);

  const incrementLoyaltyPoints = (amount: number) => {
    if (!user) return;
    updateUserMutation.mutate({
      wallet_address: user.wallet_address,
      loyalty_points: user.loyalty_points + amount,
    });
  };

  const updateUserRole = (role: 'customer' | 'seller' | 'admin') => {
    if (!user) return;
    updateUserMutation.mutate({
      wallet_address: user.wallet_address,
      role,
    });
  };

  return {
    user,
    isLoading,
    error,
    incrementLoyaltyPoints,
    updateUserRole,
  };
}
