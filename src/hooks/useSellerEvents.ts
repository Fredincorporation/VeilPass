import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Event } from '@/lib/supabase';

/**
 * Fetch seller's events
 */
export function useSellerEvents(sellerAddress: string) {
  return useQuery({
    queryKey: ['sellerEvents', sellerAddress],
    queryFn: async () => {
      if (!sellerAddress) return [];
      const { data } = await axios.get(`/api/events?seller=${sellerAddress}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!sellerAddress,
  });
}

/**
 * Create a new event (seller)
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      // Post to main events endpoint
      const { data } = await axios.post('/api/events', payload);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate seller events query for the seller who created it
      if (variables.seller_address) {
        queryClient.invalidateQueries({ queryKey: ['sellerEvents', variables.seller_address] });
      }
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

/**
 * Update seller event
 */
export function useUpdateSellerEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Event> }) => {
      const { data } = await axios.put(`/api/seller/events/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerEvents'] });
    },
  });
}

/**
 * Fetch seller analytics
 */
export function useSellerAnalytics(sellerAddress: string) {
  return useQuery({
    queryKey: ['sellerAnalytics', sellerAddress],
    queryFn: async () => {
      if (!sellerAddress) return null;
      const { data } = await axios.get(`/api/seller/analytics?seller=${sellerAddress}`);
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!sellerAddress,
  });
}
