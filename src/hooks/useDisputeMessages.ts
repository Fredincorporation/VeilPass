import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { DisputeMessage } from '@/lib/supabase';

/**
 * Fetch messages for a dispute
 */
export function useDisputeMessages(disputeId: number | null) {
  return useQuery({
    queryKey: ['dispute_messages', disputeId],
    queryFn: async () => {
      if (!disputeId) return [];
      const { data } = await axios.get(`/api/disputes/messages?dispute_id=${disputeId}`);
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!disputeId,
  });
}

/**
 * Create a new message on a dispute
 */
export function useSendDisputeMessage() {
  const queryClient = useQueryClient();

  return useMutation<any, any, Omit<DisputeMessage, 'id' | 'created_at'>>(
    {
      mutationFn: async (payload) => {
        const { data } = await axios.post('/api/disputes/messages', payload);
        return data;
      },
      onSuccess: (data, variables) => {
        // Invalidate messages query for this dispute
        if (variables.dispute_id) {
          queryClient.invalidateQueries({
            queryKey: ['dispute_messages', variables.dispute_id],
            refetchType: 'all',
          });
        }
      },
    }
  );
}
