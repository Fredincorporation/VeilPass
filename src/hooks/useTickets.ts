import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Ticket } from '@/lib/supabase';

export function useTickets(walletAddress?: string) {
  return useQuery({
    queryKey: ['tickets', walletAddress],
    queryFn: async () => {
      const params = walletAddress ? `?owner=${walletAddress}` : '';
      const { data } = await axios.get<Ticket[]>(`/api/tickets${params}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!walletAddress, // Only run query if we have a wallet address
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticket: Omit<Ticket, 'id' | 'created_at'>) => {
      const { data } = await axios.post<Ticket>('/api/tickets', ticket);
      return data;
    },
    onSuccess: (newTicket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.setQueryData(['ticket', newTicket.id], newTicket);
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Ticket> & { id: string }) => {
      const { data } = await axios.put<Ticket>('/api/tickets', { id, ...updates });
      return data;
    },
    onSuccess: (updatedTicket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.setQueryData(['ticket', updatedTicket.id], updatedTicket);
    },
  });
}
