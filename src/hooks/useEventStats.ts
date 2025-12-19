import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Fetch ticket sales count for a specific event
 */
export function useEventTicketCount(eventId: number) {
  return useQuery({
    queryKey: ['eventTickets', eventId],
    queryFn: async () => {
      if (!eventId) return 0;
      try {
        const { data } = await axios.get(`/api/events/${eventId}/tickets`);
        return data.count || 0;
      } catch (err) {
        console.error('Error fetching ticket count:', err);
        return 0;
      }
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch bids count for a specific event
 */
export function useEventBidsCount(eventId: number) {
  return useQuery({
    queryKey: ['eventBids', eventId],
    queryFn: async () => {
      if (!eventId) return 0;
      try {
        const { data } = await axios.get(`/api/events/${eventId}/bids`);
        return data.count || 0;
      } catch (err) {
        console.error('Error fetching bids count:', err);
        return 0;
      }
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
