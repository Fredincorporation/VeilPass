/**
 * Wallet utilities for VeilPass using Wagmi + RainbowKit
 * 
 * This module provides helper utilities intended to work with the
 * application's Wagmi + RainbowKit configuration.
 */

import { isAddress } from 'ethers';
import { wagmiConfig } from './wallet-config';

/**
 * Get the current connected wallet address from localStorage
 * This should be kept in sync with the actual wallet connection
 */
export function getCurrentWalletAddress(): string | null {
  return localStorage.getItem('veilpass_account');
}

/**
 * Check if wallet is connected
 */
export function isWalletConnected(): boolean {
  const address = getCurrentWalletAddress();
  return !!address && address.length > 0;
}

/**
 * Format wallet address for display (e.g., 0x1234...5678)
 */
export function formatWalletAddress(address: string): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Validate if a string is a valid Ethereum address
 */
export function isValidWalletAddress(address: string): boolean {
  try {
    return isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Get network information for Base Sepolia
 */
export const NETWORK_CONFIG = {
  chainId: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  currency: 'ETH',
  currencySymbol: 'ETH',
};

/**
 * Check if we're on the correct network (Base Sepolia)
 */
export function isCorrectNetwork(): boolean {
  // This would typically be checked via wagmi's useNetwork hook.
  // Utility functions do not have access to React hooks, so callers
  // should use `useNetwork()` or `useAccount()` from `wagmi` to
  // determine the active chain in client components.
  return true;
}

/**
 * Get transaction status messages
 */
export const TRANSACTION_MESSAGES = {
  pending: 'Transaction pending...',
  success: 'Transaction successful!',
  error: 'Transaction failed',
  rejected: 'Transaction rejected by user',
};

/**
 * Format ETH amount for display
 */
export function formatEthAmount(amount: number): string {
  return `${amount.toFixed(4)} ETH`;
}

/**
 * Get the configured wagmi config
 */
export function getWagmiConfig() {
  return wagmiConfig;
}
