'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useTranslation } from '@/lib/translation-context';
import { getWalletRole } from '@/lib/wallet-roles';
import { useToast } from '@/components/ToastContainer';
import { Ticket, Gift, Gavel, UserPlus, LogOut, Calendar, Plus, BarChart3, Settings, AlertCircle, QrCode, Shield, Heart, Megaphone, Send, X } from 'lucide-react';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [account, setAccount] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'customer' | 'seller' | 'admin'>('customer');
  const [isClient, setIsClient] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    message: '',
    userType: 'customer',
  });

  useEffect(() => {
    setIsClient(true);
    const savedAccount = localStorage.getItem('veilpass_account');
    if (savedAccount) {
      setAccount(savedAccount);
      const role = getWalletRole(savedAccount);
      setUserRole(role);
    }
  }, []);

  const handleBroadcastChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBroadcastForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendBroadcast = async () => {
    if (!broadcastForm.message.trim()) {
      showError('Please enter a message');
      return;
    }

    setIsSending(true);
    
    setTimeout(() => {
      const userTypeLabel = broadcastForm.userType === 'customer' ? 'Customers' : 'Sellers';
      showSuccess(`Broadcast sent successfully to all ${userTypeLabel}!`);
      setBroadcastForm({ message: '', userType: 'customer' });
      setShowBroadcastModal(false);
      setIsSending(false);
    }, 1000);
  };

  // Let DashboardLayout handle the display - don't return null here
  return (
    <DashboardLayout>
      {account && isClient && (
        <div className="space-y-8">
        {/* CUSTOMER DASHBOARD */}
        {userRole === 'customer' && (
          <>
            {/* Stats Cards - Display Only */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.stats', 'Your Statistics')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wide mb-2">{t('dashboard.active_tickets', 'Active Tickets')}</p>
                  <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">3</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Pending events</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide mb-2">{t('dashboard.loyalty_points', 'Loyalty Points')}</p>
                  <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">5,450</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">Available to redeem</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                  <p className="text-sm font-medium text-green-600 dark:text-green-300 uppercase tracking-wide mb-2">{t('dashboard.total_spent', 'Total Spent')}</p>
                  <p className="text-4xl font-bold text-green-900 dark:text-green-100">$1,240</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">All time spending</p>
                </div>
              </div>
            </div>

            {/* Action Cards - Clickable */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.quick_actions', 'Quick Actions')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="/tickets" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                        <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t('dashboard.my_tickets', 'My Tickets')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.view_manage_tickets', 'View and manage all your event tickets')}</p>
                  </div>
                </a>

                <a href="/loyalty" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                        <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t('dashboard.loyalty_rewards', 'Loyalty Rewards')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.redeem_points', 'Redeem your loyalty points')}</p>
                  </div>
                </a>

                <a href="/auctions" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors">
                        <Gavel className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{t('dashboard.blind_auctions', 'Blind Auctions')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.bid_exclusive', 'Bid on exclusive tickets')}</p>
                  </div>
                </a>

                <a href="/wishlist" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-red-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
                        <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{t('dashboard.my_wishlist', 'My Wishlist')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.view_saved', 'View events you\'ve saved')}</p>
                  </div>
                </a>

                <a href="/settings" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 to-teal-500/0 group-hover:from-teal-500/5 group-hover:to-teal-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg group-hover:bg-teal-200 dark:group-hover:bg-teal-800/50 transition-colors">
                        <Settings className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{t('settings.title', 'Settings')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.view_saved', 'Manage account and preferences')}</p>
                  </div>
                </a>

                <a href="/sellers/register" className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg border-2 border-blue-600 dark:border-blue-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 group-hover:from-white/10 group-hover:to-white/20 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                        <UserPlus className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-2xl text-white group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-white mb-2">Become a Seller</h3>
                    <p className="text-blue-100 text-sm">Create and sell your own events</p>
                  </div>
                </a>

                <a href="/disputes" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-red-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{t('dashboard.raise_dispute', 'Raise a Dispute')}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.report_issue', 'Report an issue or file a complaint')}</p>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}

        {/* SELLER DASHBOARD */}
        {userRole === 'seller' && (
          <>
            {/* Stats Cards - Display Only */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.stats', 'Your Statistics')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-700">
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wide mb-2">Events Created</p>
                  <p className="text-4xl font-bold text-indigo-900 dark:text-indigo-100">12</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">All time</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg p-6 border border-cyan-200 dark:border-cyan-700">
                  <p className="text-sm font-medium text-cyan-600 dark:text-cyan-300 uppercase tracking-wide mb-2">Tickets Sold</p>
                  <p className="text-4xl font-bold text-cyan-900 dark:text-cyan-100">284</p>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-2">This month: 89</p>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg p-6 border border-teal-200 dark:border-teal-700">
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-300 uppercase tracking-wide mb-2">Revenue</p>
                  <p className="text-4xl font-bold text-teal-900 dark:text-teal-100">$12,450</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">This month</p>
                </div>
              </div>
            </div>

            {/* Action Cards - Clickable */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seller Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="/seller/events" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-indigo-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition-colors">
                        <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">My Events</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your created events and sales</p>
                  </div>
                </a>

                <a href="/seller/create-event" className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 rounded-lg border-2 border-indigo-600 dark:border-indigo-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 group-hover:from-white/10 group-hover:to-white/20 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-2xl text-white group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-white mb-2">Create Event</h3>
                    <p className="text-indigo-100 text-sm">Launch a new event and sell tickets</p>
                  </div>
                </a>

                <a href="/seller/analytics" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-cyan-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800/50 transition-colors">
                        <BarChart3 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">Sales Report</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">View analytics and sales metrics</p>
                  </div>
                </a>

                <a href="/admin/sellers/scan" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 to-teal-500/0 group-hover:from-teal-500/5 group-hover:to-teal-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg group-hover:bg-teal-200 dark:group-hover:bg-teal-800/50 transition-colors">
                        <QrCode className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Ticket Scanner</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Scan and verify tickets at your events</p>
                  </div>
                </a>

                <a href="/seller/settings" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors">
                        <Settings className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Settings</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Manage seller profile and preferences</p>
                  </div>
                </a>

                <a href="/disputes" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-red-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Raise a Dispute</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm\">Report an issue or file a complaint</p>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}

        {/* ADMIN DASHBOARD */}
        {userRole === 'admin' && (
          <>
            {/* Stats Cards - Display Only */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wide mb-2">Total Users</p>
                  <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">1,234</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">+42 this month</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                  <p className="text-sm font-medium text-green-600 dark:text-green-300 uppercase tracking-wide mb-2">Transactions</p>
                  <p className="text-4xl font-bold text-green-900 dark:text-green-100">5,678</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">Total processed</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-6 border border-red-200 dark:border-red-700">
                  <p className="text-sm font-medium text-red-600 dark:text-red-300 uppercase tracking-wide mb-2">Active Disputes</p>
                  <p className="text-4xl font-bold text-red-900 dark:text-red-100">12</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">Pending resolution</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide mb-2">Platform Volume</p>
                  <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">$98K</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">This month</p>
                </div>
              </div>
            </div>

            {/* Admin Action Cards - Clickable */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Controls</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="/admin/seller-ids" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-indigo-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition-colors">
                        <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Review Seller IDs</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Verify seller identity using fhEVM encryption</p>
                  </div>
                </a>

                <a href="/admin/sellers" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                        <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Manage Sellers</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Review and approve seller applications</p>
                  </div>
                </a>

                <a href="/admin/disputes" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-red-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
                        <Gavel className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Resolve Disputes</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Review and mediate platform disputes</p>
                  </div>
                </a>

                <a href="/admin/audit" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                        <LogOut className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Audit Logs</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">View system activity and transactions</p>
                  </div>
                </a>

                <button onClick={() => setShowBroadcastModal(true)} className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                        <Megaphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-left">Send Broadcast</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm text-left">Send news and promotions to users</p>
                  </div>
                </button>

                <a href="/admin/settings" className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/10 transition-all" />
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors">
                        <Settings className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">System Settings</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Manage platform configuration</p>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full border-2 border-gray-200 dark:border-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-800">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-purple-600" />
                Send Broadcast Message
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                  Send to:
                </label>
                <select
                  name="userType"
                  value={broadcastForm.userType}
                  onChange={handleBroadcastChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:border-purple-600 transition-colors"
                >
                  <option value="customer">All Customers</option>
                  <option value="seller">All Sellers</option>
                </select>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
                  Message (HTML supported):
                </label>
                <textarea
                  name="message"
                  value={broadcastForm.message}
                  onChange={handleBroadcastChange}
                  placeholder="Type your broadcast message... You can use HTML tags like <b>, <i>, <u>, <a href=...>, etc."
                  className="w-full h-40 px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-600 transition-colors resize-none"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Character count: {broadcastForm.message.length}
                </p>
              </div>

              {/* Preview */}
              {broadcastForm.message && (
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                  <div
                    className="text-gray-900 dark:text-white text-sm"
                    dangerouslySetInnerHTML={{ __html: broadcastForm.message }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t-2 border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBroadcast}
                disabled={isSending}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold transition-all duration-300 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Sending...' : 'Send Broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
