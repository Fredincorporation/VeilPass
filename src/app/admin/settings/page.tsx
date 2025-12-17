'use client';

import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Database, Shield, Bell, DollarSign, Globe, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function AdminSettingsPage() {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    general: {
      platformName: 'VeilPass',
      platformVersion: '1.0.0',
      maintenanceMode: false,
      maintenanceMessage: 'System under maintenance. Please try again later.',
    },
    fees: {
      platformFeePercentage: 2.5,
      minimumTicketPrice: 0.05,
      maximumTicketPrice: 1000,
      payoutThreshold: 100,
    },
    security: {
      enableTwoFactor: true,
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      requireKYC: true,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      newSellerNotifications: true,
      disputeNotifications: true,
    },
    features: {
      enableAuctions: true,
      enableLoyaltyProgram: true,
      enableSocialSharing: true,
      enableTicketTransfer: true,
    },
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'fees', label: 'Fees & Pricing', icon: DollarSign },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'features', label: 'Features', icon: Settings },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    showSuccess('System settings updated successfully');
  };

  const handleReset = () => {
    showSuccess('Settings reset to default values');
  };

  const handleToggle = (category: string, field: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof settings],
        [field]: !(prev[category as keyof typeof settings] as any)[field],
      },
    }));
  };

  const handleInputChange = (category: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof settings],
        [field]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black pt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">System Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Manage platform configuration and settings</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tabs Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden sticky top-24">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full px-6 py-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border-l-4 border-l-orange-600 text-orange-600 dark:text-orange-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Platform Name</label>
                    <input
                      type="text"
                      value={settings.general.platformName}
                      onChange={(e) => handleInputChange('general', 'platformName', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Platform Version</label>
                    <input
                      type="text"
                      value={settings.general.platformVersion}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white opacity-50 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Maintenance Mode</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Put platform in maintenance mode</p>
                    </div>
                    <button
                      onClick={() => handleToggle('general', 'maintenanceMode')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.general.maintenanceMode ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.general.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {settings.general.maintenanceMode && (
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Maintenance Message</label>
                      <textarea
                        value={settings.general.maintenanceMessage}
                        onChange={(e) => handleInputChange('general', 'maintenanceMessage', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition resize-none h-24"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Fees & Pricing */}
              {activeTab === 'fees' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Platform Fee Percentage (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.fees.platformFeePercentage}
                      onChange={(e) => handleInputChange('fees', 'platformFeePercentage', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Minimum Ticket Price (ETH)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.fees.minimumTicketPrice}
                      onChange={(e) => handleInputChange('fees', 'minimumTicketPrice', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Maximum Ticket Price (ETH)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.fees.maximumTicketPrice}
                      onChange={(e) => handleInputChange('fees', 'maximumTicketPrice', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Payout Threshold ($)</label>
                    <input
                      type="number"
                      step="1"
                      value={settings.fees.payoutThreshold}
                      onChange={(e) => handleInputChange('fees', 'payoutThreshold', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition"
                    />
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Enable Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Require 2FA for admin accounts</p>
                    </div>
                    <button
                      onClick={() => handleToggle('security', 'enableTwoFactor')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.security.enableTwoFactor ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.security.enableTwoFactor ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Require KYC Verification</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Mandate KYC for sellers</p>
                    </div>
                    <button
                      onClick={() => handleToggle('security', 'requireKYC')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.security.requireKYC ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.security.requireKYC ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle('notifications', key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Features */}
              {activeTab === 'features' && (
                <div className="space-y-4">
                  {Object.entries(settings.features).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle('features', key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          value ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-800 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
