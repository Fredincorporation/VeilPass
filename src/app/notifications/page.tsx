'use client';

import React, { useState } from 'react';
import { Bell, Trash2, CheckCircle, AlertCircle, Info, Zap, Search, Filter } from 'lucide-react';

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Ticket Purchase Confirmed',
      message: 'Your ticket for Summer Music Fest has been confirmed. Check your email for details.',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'alert',
      title: 'Auction Ending Soon',
      message: 'Your auction for Classic Vinyl Record ends in 24 hours. Current bid: $150',
      timestamp: '5 hours ago',
      read: false,
    },
    {
      id: 3,
      type: 'info',
      title: 'Event Reminder',
      message: 'Comedy Night at Theatre District starts tomorrow at 8 PM. See you there!',
      timestamp: '1 day ago',
      read: true,
    },
    {
      id: 4,
      type: 'success',
      title: 'Loyalty Points Earned',
      message: 'You earned 250 loyalty points from your recent purchase.',
      timestamp: '2 days ago',
      read: true,
    },
    {
      id: 5,
      type: 'alert',
      title: 'Action Required',
      message: 'Complete your seller verification to unlock auction features.',
      timestamp: '3 days ago',
      read: true,
    },
    {
      id: 6,
      type: 'info',
      title: 'New Feature Available',
      message: 'Ticket resale is now available for your upcoming events.',
      timestamp: '4 days ago',
      read: true,
    },
  ]);

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === 'all' || (filterType === 'unread' && !notif.read) || (filterType === 'read' && notif.read);
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleRead = (id: number) => {
    setNotifications(
      notifications.map((notif) => (notif.id === id ? { ...notif, read: !notif.read } : notif))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-900/30';
      case 'alert':
        return 'hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-200 dark:border-amber-900/30';
      case 'info':
        return 'hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-900/30';
      default:
        return 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header with Icon */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 items-center">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('unread')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterType === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilterType('read')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterType === 'read'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Read
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="ml-auto px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`group relative bg-white dark:bg-gray-900 rounded-xl border-2 p-4 transition-all duration-300 cursor-pointer ${
                  !notification.read
                    ? 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                    : `border-gray-200 dark:border-gray-800 ${getNotificationColor(notification.type)}`
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 pt-1">{getNotificationIcon(notification.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`font-bold text-gray-900 dark:text-white ${!notification.read ? 'text-lg' : ''}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{notification.timestamp}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleRead(notification.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        !notification.read
                          ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                          : 'text-gray-400 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                      }`}
                      title={!notification.read ? 'Mark as read' : 'Mark as unread'}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mb-4">
              <Bell className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-2">No notifications</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              {searchTerm ? 'Try adjusting your search' : 'You\'re all caught up!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
