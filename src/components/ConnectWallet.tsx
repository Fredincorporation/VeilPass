"use client";

import React, { useEffect, useRef } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

/**
 * ConnectWallet wrapper using RainbowKit's ConnectButton.
 * Keeps the previous localStorage/event contract so other parts
 * of the app that listen for `walletConnected` / `walletDisconnected`
 * continue to work unchanged.
 */
export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const previousStateRef = useRef<{ address: string | undefined; isConnected: boolean }>({
    address: undefined,
    isConnected: false,
  });

  useEffect(() => {
    const currentState = { address, isConnected };
    const previousState = previousStateRef.current;

    // Handle connection: wallet was disconnected, now connected
    if (!previousState.isConnected && isConnected && address) {
      localStorage.setItem('veilpass_account', address);
      window.dispatchEvent(new Event('walletConnected'));
      console.log('[ConnectWallet] Wallet connected:', address);
      
      // small delay before redirect to allow other listeners
      setTimeout(() => {
        // Only redirect to dashboard if on home page, otherwise stay on current page
        try {
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath === '/dashboard') {
            router.push('/dashboard');
          }
          // If on any other page (like /tickets), don't redirect - let the page handle it
        } catch (e) {
          console.warn('Navigation error:', e);
        }
      }, 400);
    }
    // Handle disconnection: wallet was connected, now disconnected
    else if (previousState.isConnected && !isConnected) {
      localStorage.removeItem('veilpass_account');
      window.dispatchEvent(new Event('walletDisconnected'));
      console.log('[ConnectWallet] Wallet disconnected');
    }
    // Handle address change (wallet switched)
    else if (isConnected && previousState.address && address && previousState.address !== address) {
      localStorage.setItem('veilpass_account', address);
      window.dispatchEvent(new Event('walletConnected'));
      console.log('[ConnectWallet] Wallet address changed:', address);
    }

    // Update ref for next comparison
    previousStateRef.current = currentState;
  }, [isConnected, address, router]);

  return (
    <ConnectButton label="Connect Wallet" showBalance={false} chainStatus="icon" accountStatus="avatar" />
  );
}

