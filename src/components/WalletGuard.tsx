'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Wallet } from 'lucide-react';

interface WalletGuardProps {
  children: React.ReactNode;
}

/**
 * WalletGuard wraps any page that requires wallet connection
 * Shows a modal overlay if wallet is disconnected
 */
export function WalletGuard({ children }: WalletGuardProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();

  // Pages that don't require wallet connection
  const publicPages = ['/'];
  const requiresWallet = !publicPages.includes(pathname);

  useEffect(() => {
    setIsClient(true);
    const savedAccount = localStorage.getItem('veilpass_account');
    setAccount(savedAccount);
    // Show overlay if no account and page requires wallet
    setShowOverlay(!savedAccount && requiresWallet);
  }, [requiresWallet]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedAccount = localStorage.getItem('veilpass_account');
      setAccount(savedAccount);
      setShowOverlay(!savedAccount && requiresWallet);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [requiresWallet]);

  // Listen for custom disconnect event
  useEffect(() => {
    const handleDisconnect = () => {
      setAccount(null);
      setShowOverlay(requiresWallet);
    };

    window.addEventListener('walletDisconnected', handleDisconnect);
    return () => window.removeEventListener('walletDisconnected', handleDisconnect);
  }, [requiresWallet]);

  const getExtensionProvider = () => {
    if (typeof window !== 'undefined' && window.coinbaseWalletExtension) {
      return window.coinbaseWalletExtension;
    }
    return null;
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setConnectionError('');

    try {
      const provider = getExtensionProvider();

      if (!provider) {
        setConnectionError('Coinbase Wallet extension not installed. Please install it from your browser\'s extension store.');
        setIsConnecting(false);
        return;
      }

      const accounts = (await provider.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        setConnectionError('No accounts returned from extension');
        setIsConnecting(false);
        return;
      }

      const userAccount = accounts[0];

      if (!userAccount.match(/^0x[a-fA-F0-9]{40}$/)) {
        setConnectionError('Invalid account format received');
        setIsConnecting(false);
        return;
      }

      setAccount(userAccount);
      localStorage.setItem('veilpass_account', userAccount);
      
      // Dispatch custom event to notify ConnectWallet component
      const event = new Event('walletConnected');
      window.dispatchEvent(event);
      
      setShowOverlay(false);
    } catch (err: any) {
      if (err.code === 4001) {
        setConnectionError('You rejected the connection');
      } else if (err.code === -32002) {
        setConnectionError('Connection request already pending');
      } else if (err.message?.includes('user rejected') || err.message?.includes('rejected')) {
        setConnectionError('You rejected the connection');
      } else {
        setConnectionError(err.message || 'Connection failed');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isClient) {
    return children;
  }

  if (showOverlay) {
    return (
      <>
        {children}
        {/* Overlay Modal */}
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full border-2 border-gray-200 dark:border-gray-800 shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Icon */}
            <div className="flex justify-center pt-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Wallet Disconnected
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your wallet has been disconnected. Please reconnect to continue accessing this page.
              </p>

              {/* Info Box */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  <span className="font-semibold">Tip:</span> Connect your wallet to continue using VeilPass.
                </p>
              </div>

              {/* Error Message */}
              {connectionError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-700 dark:text-red-300">{connectionError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 flex-col">
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return children;
}
