import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface AdminNotification {
  id: number;
  user_address: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

/**
 * Fetch notifications for an admin user
 */
export function useAdminNotifications(adminWallet: string) {
  return useQuery({
    queryKey: ['adminNotifications', adminWallet],
    queryFn: async () => {
      if (!adminWallet) return [];
      const { data } = await axios.get(`/api/admin/notifications?admin_wallet=${adminWallet}`);
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute (more real-time)
    enabled: !!adminWallet,
  });
}

/**
 * Fetch unread admin notifications
 */
export function useAdminUnreadNotifications(adminWallet: string) {
  return useQuery({
    queryKey: ['adminUnreadNotifications', adminWallet],
    queryFn: async () => {
      if (!adminWallet) return [];
      const { data } = await axios.get(`/api/admin/notifications?admin_wallet=${adminWallet}&unread_only=true`);
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds for unread
    enabled: !!adminWallet,
  });
}

/**
 * Mark admin notifications as read
 */
export function useMarkAdminNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: number[]) => {
      const { data } = await axios.put('/api/admin/notifications', {
        notification_ids: notificationIds,
        read: true,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['adminUnreadNotifications'] });
    },
  });
}

/**
 * Delete admin notifications
 */
export function useDeleteAdminNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: number[]) => {
      const { data } = await axios.put('/api/admin/notifications', {
        notification_ids: notificationIds,
        deleted: true,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['adminUnreadNotifications'] });
    },
  });
}
