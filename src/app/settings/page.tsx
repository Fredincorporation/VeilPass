'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Mail, Smartphone, Globe, Bell, Palette, LogOut, Save, X } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useTranslation } from '@/lib/translation-context';
import { useThemeContext } from '@/lib/theme-context';
import { useUserPreferences, useUpdateUserPreferences } from '@/hooks/useUserPreferences';

export default function SettingsPage() {
  const { showSuccess, showError, showWarning } = useToast();
  const { t } = useTranslation();
  const { theme, setThemeMode } = useThemeContext();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  // Fetch user preferences from database
  const { data: dbPreferences, isLoading } = useUserPreferences(account || undefined);
  const { mutate: updatePreferences } = useUpdateUserPreferences();

  // Form states
  const [formData, setFormData] = useState({
    language: 'en',
    timezone: 'America/New_York',
    theme: theme || 'auto',
  });

  const [notifications, setNotifications] = useState({
    event_reminders: true,
    promotions: true,
    reviews: true,
    auctions: true,
    disputes: true,
    newsletter: false,
  });

  useEffect(() => {
    const savedAccount = localStorage.getItem('veilpass_account');
    setAccount(savedAccount);
  }, []);

  // Load preferences from database when available
  useEffect(() => {
    if (dbPreferences) {
      setNotifications({
        event_reminders: dbPreferences.event_reminders ?? true,
        promotions: dbPreferences.promotions ?? true,
        reviews: dbPreferences.reviews ?? true,
        auctions: dbPreferences.auctions ?? true,
        disputes: dbPreferences.disputes ?? true,
        newsletter: dbPreferences.newsletter ?? false,
      });
    }
  }, [dbPreferences]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Apply theme immediately when changed
    if (field === 'theme') {
      setThemeMode(value as 'light' | 'dark' | 'auto');
    }
  };

  const handleNotificationChange = async (field: string) => {
    const newValue = !notifications[field as keyof typeof notifications];
    setNotifications(prev => ({ ...prev, [field as keyof typeof notifications]: newValue }));
    
    // Show toast notification
    const labelMap: { [key: string]: string } = {
      event_reminders: t('settings.event_reminders', 'Event Reminders'),
      promotions: t('settings.promotions', 'Promotions & Deals'),
      reviews: t('settings.reviews', 'Review Updates'),
      auctions: t('settings.auctions', 'Auction Activity'),
      disputes: t('settings.disputes', 'Dispute Alerts'),
      newsletter: t('settings.newsletter', 'Newsletter'),
    };
    
    const label = labelMap[field] || field;
    const status = newValue ? 'enabled' : 'disabled';
    showSuccess(`${label} ${status}`);
    
    // Save to database immediately
    if (account) {
      updatePreferences({
        wallet_address: account,
        [field]: newValue,
      } as any);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showSuccess('Settings saved successfully');
    } catch (error) {
      showError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnectWallet = async () => {
    setConfirmDisconnect(false);
    localStorage.removeItem('veilpass_account');
    showSuccess('Wallet disconnected');
    setTimeout(() => window.location.href = '/', 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('settings.title', 'Settings')}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-14">{t('dashboard.view_saved', 'Manage your account preferences and security settings')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
              {[
                { id: 'general', label: t('settings.general', 'General'), icon: Palette },
                { id: 'notifications', label: t('settings.notifications', 'Notifications'), icon: Bell },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-200 dark:border-gray-800 transition ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 text-teal-600 dark:text-teal-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('settings.general', 'General Settings')}</h2>

                  <div className="space-y-4">
                    {/* Language */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('common.language', 'Language')}</label>
                      <select
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('settings.timezone', 'Timezone')}</label>
                      <select
                        value={formData.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Central European Time (CET)</option>
                      </select>
                    </div>

                    {/* Theme */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('common.theme', 'Theme')}</label>
                      <select
                        value={formData.theme}
                        onChange={(e) => handleInputChange('theme', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold transition-all duration-300 hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? t('common.loading', 'Saving...') : t('common.save', 'Save Changes')}
                </button>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('settings.notifications', 'Notification Preferences')}</h2>

                  <div className="space-y-4">
                    {[
                      { key: 'event_reminders', label: t('settings.event_reminders', 'Event Reminders'), description: t('settings.event_reminders_desc', 'Get notified before your events start') },
                      { key: 'promotions', label: t('settings.promotions', 'Promotions & Deals'), description: t('settings.promotions_desc', 'Receive exclusive offers and discounts') },
                      { key: 'reviews', label: t('settings.reviews', 'Review Updates'), description: t('settings.reviews_desc', 'Notifications when events you attended get reviewed') },
                      { key: 'auctions', label: t('settings.auctions', 'Auction Activity'), description: t('settings.auctions_desc', 'Updates on your active auction bids') },
                      { key: 'disputes', label: t('settings.disputes', 'Dispute Alerts'), description: t('settings.disputes_desc', 'Notifications about disputes involving you') },
                      { key: 'newsletter', label: t('settings.newsletter', 'Newsletter'), description: t('settings.newsletter_desc', 'Weekly updates and curated event picks') },
                    ].map(notif => (
                      <div key={notif.key} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{notif.label}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{notif.description}</p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(notif.key)}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                            notifications[notif.key as keyof typeof notifications]
                              ? 'bg-teal-600'
                              : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                              notifications[notif.key as keyof typeof notifications] ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold transition-all duration-300 hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? t('common.loading', 'Saving...') : t('common.save', 'Save Preferences')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      {confirmDisconnect && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('msg.confirm', 'Confirm Disconnection')}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('settings.disconnect_desc', 'Are you sure you want to disconnect your wallet? You\'ll need to reconnect to continue using the platform.')}</p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDisconnect(false)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 font-semibold transition flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleDisconnectWallet}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t('settings.disconnect_wallet', 'Disconnect')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
