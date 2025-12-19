import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { PlatformSettings } from '@/lib/supabase';

/**
 * Hook to fetch platform settings (admin only)
 */
export function usePlatformSettings() {
  return useQuery({
    queryKey: ['platformSettings'],
    queryFn: async () => {
      const { data } = await axios.get<PlatformSettings>('/api/admin/settings');
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to update platform settings (admin only)
 */
export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<PlatformSettings>) => {
      const { data } = await axios.put<PlatformSettings>(
        '/api/admin/settings',
        updates
      );
      return data;
    },
    onSuccess: (updatedSettings) => {
      queryClient.invalidateQueries({
        queryKey: ['platformSettings'],
      });
      queryClient.setQueryData(['platformSettings'], updatedSettings);
    },
  });
}
