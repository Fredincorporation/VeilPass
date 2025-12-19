'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ConnectWallet using ONLY the Coinbase Wallet browser extension
 * NO SDK, NO mocks - direct extension provider only
 */
export function ConnectWallet() {
  const [account, setAccount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    // Restore account from localStorage on mount
    const savedAccount = localStorage.getItem('veilpass_account');
    if (savedAccount && savedAccount.match(/^0x[a-fA-F0-9]{40}$/)) {
      setAccount(savedAccount);
    }
  }, []);

  // Listen for wallet connection events from other components (e.g., WalletGuard)
  useEffect(() => {
    const handleWalletConnected = () => {
      const savedAccount = localStorage.getItem('veilpass_account');
      if (savedAccount && savedAccount.match(/^0x[a-fA-F0-9]{40}$/)) {
        setAccount(savedAccount);
      }
    };

    window.addEventListener('walletConnected', handleWalletConnected);
    return () => window.removeEventListener('walletConnected', handleWalletConnected);
  }, []);

  const getExtensionProvider = () => {
    // The Coinbase extension injects into window.coinbaseWalletExtension
    // This is NOT the SDK - it's the actual browser extension
    if (typeof window !== 'undefined' && window.coinbaseWalletExtension) {
      return window.coinbaseWalletExtension;
    }
    return null;
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError('');
    setAccount('');

    try {
      const provider = getExtensionProvider();

      if (!provider) {
        setError('Coinbase Wallet extension not installed. Please install it from your browser\'s extension store.');
        setIsLoading(false);
        return;
      }

      console.log('Extension provider found, requesting accounts...');

      // Call eth_requestAccounts directly on the extension provider
      // This will show the extension's native UI for connection
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      }) as string[];

      console.log('Accounts returned from extension:', accounts);

      if (!accounts || accounts.length === 0) {
        setError('No accounts returned from extension');
        setIsLoading(false);
        return;
      }

      const userAccount = accounts[0];
      
      // Validate it's a real address (not a mock)
      if (!userAccount.match(/^0x[a-fA-F0-9]{40}$/)) {
        setError('Invalid account format received');
        setIsLoading(false);
        return;
      }

      console.log('Successfully connected account:', userAccount);
      setAccount(userAccount);
      // Store in localStorage so it persists across page refreshes
      localStorage.setItem('veilpass_account', userAccount);
      
      // Dispatch custom event to notify other components (e.g., Dashboard)
      const event = new Event('walletConnected');
      window.dispatchEvent(event);
      
      // Auto-redirect to dashboard after successful connection
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);

    } catch (err: any) {
      console.error('Connection error:', err);
      
      if (err.code === 4001) {
        setError('You rejected the connection');
      } else if (err.code === -32002) {
        setError('Connection request already pending');
      } else if (err.message?.includes('user rejected') || err.message?.includes('rejected')) {
        setError('You rejected the connection');
      } else {
        setError(err.message || 'Connection failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    
    try {
      // Clear localStorage and verify it's gone
      localStorage.removeItem('veilpass_account');
      
      // Add a small delay to ensure storage is cleared before state updates
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify it's actually gone
      let stored = localStorage.getItem('veilpass_account');
      if (stored) {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Clear state
      setAccount('');
      setError('');
      
      // Dispatch custom event to notify other components (e.g., DashboardLayout)
      const event = new Event('walletDisconnected');
      window.dispatchEvent(event);
      
      // Try to disconnect from provider
      const provider = getExtensionProvider();
      if (provider && provider.disconnect) {
        try {
          await provider.disconnect();
        } catch (e) {
          // Silent fail
        }
      }
    } catch (err) {
      console.error('Error during disconnect:', err);
      setError('Error disconnecting wallet');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {!account ? (
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-600 dark:text-gray-300">Connected</span>
              <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            title="Disconnect wallet"
            className="ml-2 p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {error && (
        <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
    </div>
  );
}

