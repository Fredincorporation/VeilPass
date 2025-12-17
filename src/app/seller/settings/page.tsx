'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, X, Loader, Check, Bell, Shield, LogOut } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function SellerSettingsPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const [profileData, setProfileData] = useState({
    email: 'john@example.com',
    businessName: 'John Events Co.',
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newsAndUpdates: true,
    eventReminders: true,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key: string) => {
    setNotificationPrefs((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSaveStatus('success');
      setIsSaving(false);
      showSuccess('Settings saved successfully');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setIsSaving(false);
      setSaveStatus('error');
      showError('Failed to save settings');
      setTimeout(() => setSaveStatus('idle'), 2000);
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={profileData.businessName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
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
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {key
                            .replace(/([A-Z])/g, ' $1')
                            .toLowerCase()
                            .trim()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {key === 'emailNotifications' && 'Receive notifications via email'}
                          {key === 'smsNotifications' && 'Receive notifications via SMS'}
                          {key === 'newsAndUpdates' && 'Get news and feature updates'}
                          {key === 'eventReminders' && 'Reminders for upcoming events'}
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

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSave}
            disabled={isSaving || saveStatus === 'success'}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              saveStatus === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white disabled:opacity-50'
            }`}
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <Check className="w-4 h-4" />
                Saved Successfully
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>

          <button className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-2">
            <X className="w-4 h-4" />
            Discard
          </button>
        </div>

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
