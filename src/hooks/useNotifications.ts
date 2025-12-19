import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface Notification {
  id: number;
  user_address: string;
  type: 'success' | 'alert' | 'info';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

/**
 * Fetch user's notifications
 */
export function useNotifications(userAddress: string) {
  return useQuery({
    queryKey: ['notifications', userAddress],
    queryFn: async () => {
      if (!userAddress) return [];
      const { data } = await axios.get(`/api/notifications?user=${userAddress}`);
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute (more real-time)
    enabled: !!userAddress,
  });
}

/**
 * Mark notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const { data } = await axios.put(`/api/notifications/${notificationId}`, { read: true });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Delete notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      const { data } = await axios.delete(`/api/notifications/${notificationId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
