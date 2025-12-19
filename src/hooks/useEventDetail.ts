import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Event } from '@/lib/supabase';

/**
 * Fetch a specific event by ID
 */
export function useEventDetail(eventId: string | number) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      const { data } = await axios.get<Event>(`/api/events/${eventId}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!eventId,
  });
}

/**
 * Fetch event reviews
 */
export function useEventReviews(eventId: string | number) {
  return useQuery({
    queryKey: ['eventReviews', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const { data } = await axios.get(`/api/events/${eventId}/reviews`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!eventId,
  });
}
