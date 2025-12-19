import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Event } from '@/lib/supabase';

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await axios.get<Event[]>('/api/events');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
