import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface Wishlist {
  id: number;
  user_address: string;
  event_id: number;
  created_at: string;
}

/**
 * Fetch user's wishlisted events
 */
export function useWishlists(userAddress: string) {
  return useQuery({
    queryKey: ['wishlists', userAddress],
    queryFn: async () => {
      if (!userAddress) return [];
      const { data } = await axios.get(`/api/wishlists?user=${userAddress}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: userAddress !== '', // Only run if we have a non-empty user address
  });
}

/**
 * Add event to wishlist
 */
export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<Wishlist, 'id' | 'created_at'>) => {
      const { data } = await axios.post('/api/wishlists', payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlists', variables.user_address] });
    },
  });
}

/**
 * Remove event from wishlist
 */
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<Wishlist, 'id' | 'created_at'>) => {
      const { data } = await axios.delete('/api/wishlists', { data: payload });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlists', variables.user_address] });
    },
  });
}
