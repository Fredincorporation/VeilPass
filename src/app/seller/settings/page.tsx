'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Bell, Shield, LogOut } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useUpdateUser } from '@/hooks/useUser';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserPreferences, useUpdateUserPreferences } from '@/hooks/useUserPreferences';

export default function SellerSettingsPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  // Update user mutation
  const { mutate: updateUser } = useUpdateUser();

  // Fetch user profile and preferences from database
  const { data: userProfile } = useUserProfile(account || undefined);
  const { data: dbPreferences } = useUserPreferences(account || undefined);
  const { mutate: updatePreferences } = useUpdateUserPreferences();

  const [profileData, setProfileData] = useState({
    businessName: '',
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    news_and_updates: true,
    event_reminders: true,
  });

  useEffect(() => {
    const savedAccount = localStorage.getItem('veilpass_account');
    setAccount(savedAccount);
  }, []);

  // Load business name from database when profile loads
  useEffect(() => {
    if (userProfile?.business_name) {
      setProfileData({ businessName: userProfile.business_name });
    } else {
      // Fallback to localStorage if not in database
      const savedBusinessName = localStorage.getItem('veilpass_business_name') || '';
      setProfileData({ businessName: savedBusinessName });
    }
  }, [userProfile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Load preferences from database when available
  useEffect(() => {
    if (dbPreferences) {
      setNotificationPrefs({
        news_and_updates: dbPreferences.news_and_updates ?? true,
        event_reminders: dbPreferences.event_reminders ?? true,
      });
    }
  }, [dbPreferences]);

  const handleNotificationChange = (key: string) => {
    const newValue = !notificationPrefs[key as keyof typeof notificationPrefs];
    setNotificationPrefs((prev) => ({ ...prev, [key as keyof typeof prev]: newValue }));
    
    // Show toast with formatted label
    const labelMap: { [key: string]: string } = {
      news_and_updates: 'News & Updates',
      event_reminders: 'Event Reminders',
    };
    
    const label = labelMap[key] || key;
    const status = newValue ? 'enabled' : 'disabled';
    showSuccess(`${label} ${status}`);
    
    // Save to database immediately
    if (account) {
      updatePreferences({
        wallet_address: account,
        [key]: newValue,
      } as any);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      localStorage.removeItem('veilpass_account');
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('walletDisconnected'));
      showSuccess('Wallet disconnected successfully');
      setShowDisconnectConfirm(false);
      setTimeout(() => router.push('/'), 1000);
    } catch (error) {
      showError('Failed to disconnect wallet');
      setShowDisconnectConfirm(false);
    }
  };

  const handleDisconnectClick = () => {
    setShowDisconnectConfirm(true);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Manage your seller account and preferences</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b-2 border-gray-200 dark:border-gray-800 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all border-b-2 -mb-[2px] ${
                  activeTab === tab.id
                    ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                    Business Name
                  </label>
                  <div className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                    {profileData.businessName || 'Not set'}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">This field was set during registration and cannot be changed.</p>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {Object.entries(notificationPrefs).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {key === 'news_and_updates' && 'News & Updates'}
                          {key === 'event_reminders' && 'Event Reminders'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {key === 'news_and_updates' && 'Get news and feature updates'}
                          {key === 'event_reminders' && 'Reminders for upcoming events'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-cyan-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}



        {/* Account Actions */}
        <div className="mt-12 pt-8 border-t-2 border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Actions</h2>
          <button 
            onClick={handleDisconnectClick}
            className="w-full px-6 py-3 rounded-xl border-2 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Disconnect Wallet
          </button>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 shadow-2xl max-w-sm w-full p-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Disconnect Wallet?</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Are you sure you want to disconnect your wallet? You will need to reconnect to continue using VeilPass.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnectWallet}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
