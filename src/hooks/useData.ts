import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      // Mock data for development
      return [
        {
          id: 1,
          title: 'Summer Music Fest',
          date: 'Jun 15, 2025',
          price: 285,
          sold: 450,
        },
        {
          id: 2,
          title: 'Tech Conference 2025',
          date: 'Jul 22, 2025',
          price: 500,
          sold: 320,
        },
      ];
    },
  });
}

export function useTickets(address: string | null) {
  return useQuery({
    queryKey: ['tickets', address],
    queryFn: async () => {
      if (!address) return [];
      // Fetch from contract
      return [];
    },
    enabled: !!address,
  });
}

export function useLoyaltyPoints(address: string | null) {
  return useQuery({
    queryKey: ['loyalty', address],
    queryFn: async () => {
      if (!address) return 0;
      // Fetch from contract
      return 5450;
    },
    enabled: !!address,
  });
}
