"use client";

import React from 'react';
import { ConnectButton as RainbowKitConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useToast } from './ToastContainer';

/**
 * Beautiful branded ConnectButton using RainbowKit
 * 
 * Features:
 * - Universal wallet support (MetaMask, Coinbase, WalletConnect, etc.)
 * - Desktop & Mobile optimized
 * - Automatic network handling
 * - Built-in account management
 * - Proper error handling
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
  const { showSuccess } = useToast();
  const { isConnected } = useAccount();

  React.useEffect(() => {
    if (isConnected) {
      showSuccess('Wallet connected successfully');
    }
  }, [isConnected, showSuccess]);

  // Note: RainbowKit's ConnectButton handles all styling internally
  // The className, variant, and size props can be ignored as RainbowKit
  // provides consistent, accessible styling by default
  return (
    <RainbowKitConnectButton
      label="Connect Wallet"
      showBalance={false}
      chainStatus="icon"
      accountStatus="avatar"
    />
  );
}

export default ConnectButton;
