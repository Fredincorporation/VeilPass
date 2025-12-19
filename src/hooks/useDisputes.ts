import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface Dispute {
  id: number;
  ticket_id: string;
  user_address: string;
  reason: string;
  description: string;
  status: 'OPEN' | 'RESOLVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

/**
 * Fetch user's disputes
 */
export function useDisputes(userAddress: string) {
  return useQuery({
    queryKey: ['disputes', userAddress],
    queryFn: async () => {
      if (!userAddress) return [];
      const { data } = await axios.get(`/api/disputes?user=${userAddress}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userAddress,
  });
}

/**
 * Create a new dispute
 */
export function useCreateDispute() {
  const queryClient = useQueryClient();

  return useMutation<any, any, Omit<Dispute, 'id' | 'created_at' | 'updated_at'>>(
    {
      mutationFn: async (payload) => {
        const { data } = await axios.post('/api/disputes', payload);
        return data;
      },
      onSuccess: (data, variables) => {
        // Invalidate the specific user's disputes query and force refetch
        if (variables.user_address) {
          queryClient.invalidateQueries({ 
            queryKey: ['disputes', variables.user_address],
            refetchType: 'all'
          });
        }
      },
    }
  );
}

/**
 * Update dispute status
 */
export function useUpdateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await axios.put(`/api/disputes/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
    },
  });
}
