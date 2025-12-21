'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

/**
 * RainbowKit Connect Wallet Button
 * Provides universal wallet support (MetaMask, Coinbase Wallet, WalletConnect, etc.)
 * Automatically handles mobile deep linking and desktop provider injection
 */
export function ConnectWallet() {
  return (
    <ConnectButton
      label="Connect Wallet"
      showBalance={false}
      chainStatus="icon"
      accountStatus="avatar"
    />
  );
}
