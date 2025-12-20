"use client";

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { ConnectWalletProps } from '@coinbase/onchainkit/wallet';
import { isMobileDevice } from '@/lib/wallet-config';
import { useToast } from './ToastContainer';

/**
 * Beautiful branded ConnectButton using Coinbase OnchainKit
 * 
 * Features:
 * - Desktop: Clean "Connect with Base" button
 * - Mobile: "Continue with Email" button (Smart Wallet only)
 * - Proper error handling and loading states
 * - Automatic network switching to Base Sepolia
 * - Fallback to manual connection if needed
 */

interface ConnectButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function ConnectButton({ 
  className = '', 
  variant = 'primary',
  size = 'md'
}: ConnectButtonProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const [isConnecting, setIsConnecting] = useState(false);
  const [showManualConnect, setShowManualConnect] = useState(false);

  // Format wallet address for display
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Check if on correct network
  const isCorrectNetwork = chain?.id === 84532;

  // Handle manual connection fallback
  const handleManualConnect = async () => {
    if (connectors.length === 0) {
      showError('No wallet connectors available');
      return;
    }

    setIsConnecting(true);
    try {
      await connect({ connector: connectors[0] });
      showSuccess('Wallet connected successfully');
    } catch (err: any) {
      console.error('Manual connection error:', err);
      showError(err?.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      await disconnect();
      showSuccess('Wallet disconnected');
    } catch (err: any) {
      console.error('Disconnect error:', err);
      showError('Failed to disconnect wallet');
    }
  };

  // Button styling based on variant and size
  const getButtonClasses = () => {
    const baseClasses = 'transition-all duration-200 font-semibold rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = variant === 'primary' 
      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-blue-500 shadow-lg hover:shadow-xl focus:ring-blue-500'
      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500';
    
    const sizeClasses = size === 'lg' ? 'px-6 py-3 text-lg' : size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2.5';
    
    return `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;
  };

  // Button text based on state
  const getButtonText = () => {
    if (isConnecting || isPending) return 'Connecting...';
    if (isConnected) return `Connected: ${formatAddress(address!)}`;
    return isMobileDevice() ? 'Continue with Email' : 'Connect with Base';
  };

  // Show network warning if not on Base Sepolia
  useEffect(() => {
    const trySwitchNetwork = async () => {
      if (typeof window === 'undefined' || !window.ethereum) return;
      const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
      const chainIdHex = '0x14A34'; // 84532 in hex

      try {
        // Attempt to switch network in the wallet
        await (window.ethereum as any).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        });
        showSuccess('Switched to Base Sepolia');
        return;
      } catch (switchErr: any) {
        // 4902 indicates the chain is not added to the wallet
        if (switchErr?.code === 4902) {
          try {
            await (window.ethereum as any).request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: chainIdHex,
                chainName: 'Base Sepolia',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: [rpcUrl],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              }],
            });
            showSuccess('Base Sepolia added to wallet');
            return;
          } catch (addErr: any) {
            console.warn('Failed to add Base Sepolia to wallet:', addErr);
            showWarning('Please add Base Sepolia network manually in your wallet');
          }
        } else {
          console.warn('Failed to switch network:', switchErr);
          showWarning(`Connected to ${chain?.name}. Please switch to Base Sepolia for optimal experience.`);
        }
      }
    };

    if (isConnected && !isCorrectNetwork && chain) {
      // Try automatic switch, but still show warning if it fails
      trySwitchNetwork();
    }
  }, [isConnected, chain, isCorrectNetwork, showWarning]);

  // If already connected, show disconnect button
  if (isConnected) {
    return (
      <button
        onClick={handleDisconnect}
        className={`${getButtonClasses()} hover:scale-105 active:scale-95`}
        title="Disconnect wallet"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          {getButtonText()}
        </span>
      </button>
    );
  }

  // If error occurred, show retry button
  if (error && !showManualConnect) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setShowManualConnect(true)}
          className={getButtonClasses()}
          title="Retry connection"
        >
          Retry Connection
        </button>
        <p className="text-red-500 dark:text-red-400 text-xs">
          Connection failed: {error.message}
        </p>
      </div>
    );
  }

  // Manual connection fallback
  if (showManualConnect) {
    return (
      <div className="space-y-3">
        <button
          onClick={handleManualConnect}
          disabled={isConnecting}
          className={getButtonClasses()}
          title="Manual wallet connection"
        >
          <span className="flex items-center gap-2">
            {isConnecting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>🔗</span>
                <span>Connect Wallet</span>
              </>
            )}
          </span>
        </button>
        <p className="text-gray-500 dark:text-gray-400 text-xs">
          Tip: Make sure Coinbase Wallet extension is installed on desktop, or use the Coinbase Wallet app on mobile.
        </p>
      </div>
    );
  }

  // Default: Use Coinbase OnchainKit ConnectWallet component
  return (
    <ConnectWallet
      className={getButtonClasses()}
      // Event handlers
      onConnect={() => {
        console.log('✅ Wallet connected successfully');
        showSuccess('Wallet connected successfully');
      }}
    />
  );
}

export default ConnectButton;
