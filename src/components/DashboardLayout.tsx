'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getWalletRole } from '@/lib/wallet-roles';
import { Wallet } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Protects dashboard from unauthorized access
 * Shows connection prompt if no wallet is connected
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    
    // Check if wallet is connected
    const savedAccount = localStorage.getItem('veilpass_account');
    
    if (!savedAccount) {
      // No wallet connected - show prompt after a brief delay
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return;
    }
    
    setAccount(savedAccount);
    setIsLoading(false);
  }, [router]);

  // Listen for storage changes (disconnect from other tabs/windows or ConnectWallet component)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedAccount = localStorage.getItem('veilpass_account');
      setAccount(savedAccount);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom disconnect event from ConnectWallet component
  useEffect(() => {
    const handleDisconnect = () => {
      setAccount(null);
    };

    window.addEventListener('walletDisconnected', handleDisconnect);
    return () => window.removeEventListener('walletDisconnected', handleDisconnect);
  }, []);

  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Content */}
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Welcome to VeilPass
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
              Connect your wallet to access the dashboard and manage your tickets, events, and more.
            </p>

            {/* Connection Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>✓ Click the "Connect Wallet" button in the top right</li>
                <li>✓ Approve the connection in your wallet extension</li>
                <li>✓ You'll be redirected to your personalized dashboard</li>
              </ul>
            </div>

            {/* Role Information */}
            <div className="space-y-3 mb-8">
              <div className="text-sm">
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Your Role</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Customer (or Seller/Admin if registered)
                </p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Supported Wallets</p>
                <p className="font-semibold text-gray-900 dark:text-white">Coinbase Wallet Extension</p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all hover:shadow-lg"
            >
              Go to Home & Connect Wallet
            </button>

            {/* FAQ */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">Don't have a wallet?</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Install Coinbase Wallet extension for your browser to get started.
              </p>
              <a
                href="https://www.coinbase.com/wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Download Coinbase Wallet →
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const role = getWalletRole(account);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Role indicator badge */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Role: <span className="font-semibold capitalize text-blue-600 dark:text-blue-400">{role}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Connected Wallet</p>
            <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
              {account.slice(0, 6)}...{account.slice(-4)}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
