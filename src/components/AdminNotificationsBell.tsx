'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle } from 'lucide-react';
import { useAdminUnreadNotifications, useMarkAdminNotificationsAsRead } from '@/hooks/useAdminNotifications';

interface AdminNotificationsBellProps {
  adminWallet?: string;
  className?: string;
}

export default function AdminNotificationsBell({ adminWallet, className = '' }: AdminNotificationsBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadNotifications = [] } = useAdminUnreadNotifications(adminWallet || '');
  const { mutate: markAsRead } = useMarkAdminNotificationsAsRead();

  const handleMarkAllAsRead = () => {
    console.log('[AdminNotificationsBell] handleMarkAllAsRead called', {
      unreadCount: unreadNotifications.length,
      adminWallet,
    });
    if (unreadNotifications.length > 0 && adminWallet) {
      console.log('[AdminNotificationsBell] Calling markAsRead with:', {
        notificationIds: unreadNotifications.map((n: any) => n.id),
        adminWallet,
      });
      markAsRead({
        notificationIds: unreadNotifications.map((n: any) => n.id),
        adminWallet,
      });
    } else {
      console.warn('[AdminNotificationsBell] Missing data:', {
        hasNotifications: unreadNotifications.length > 0,
        hasWallet: !!adminWallet,
      });
    }
  };

  const handleNotificationClick = (notificationId: number) => {
    if (adminWallet) {
      markAsRead({
        notificationIds: [notificationId],
        adminWallet,
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('seller') || type.includes('application')) {
      return '👤';
    } else if (type.includes('kyc')) {
      return '🔐';
    } else if (type.includes('alert') || type.includes('warning')) {
      return '⚠️';
    }
    return '📢';
  };

  const getNotificationColor = (type: string) => {
    if (type === 'seller_application') {
      return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    } else if (type.includes('kyc')) {
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    } else if (type.includes('rejected')) {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        {unreadNotifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-600 rounded-full">
            {Math.min(unreadNotifications.length, 9)}
            {unreadNotifications.length > 9 ? '+' : ''}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Notifications {unreadNotifications.length > 0 && <span className="text-red-600">({unreadNotifications.length})</span>}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {unreadNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No unread notifications</p>
              </div>
            ) : (
              unreadNotifications.map((notification: any) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString()} at{' '}
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-red-600"></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {unreadNotifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleMarkAllAsRead}
                className="w-full px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Mark All as Read
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
