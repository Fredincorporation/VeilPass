'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export enum UserRole {
  GUEST = 'guest',
  CUSTOMER = 'customer',
  SELLER = 'seller',
  ADMIN = 'admin',
}

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  role: UserRole;
  balance: string;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToBaseSepolia: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.GUEST);
  const [balance, setBalance] = useState('0');
  const [chainId, setChainId] = useState<number | null>(null);

  const connect = async () => {
    // Placeholder for wallet connection logic
    // Will be replaced with actual onchainkit integration
  };

  const disconnect = () => {
    setAddress(null);
    setRole(UserRole.GUEST);
  };

  const switchToBaseSepolia = async () => {
    // Placeholder for chain switching
  };

  useEffect(() => {
    // Reconnect on mount if previously connected
    const savedAddress = localStorage.getItem('veilpass_address');
    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, []);

  const value: WalletContextType = {
    address,
    isConnected: !!address,
    role,
    balance,
    chainId,
    connect,
    disconnect,
    switchToBaseSepolia,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

// Safe hook that returns a fallback when WalletProvider is not present.
export function useSafeWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    return {
      address: null,
      isConnected: false,
      role: UserRole.GUEST,
      balance: '0',
      chainId: null,
      connect: async () => {},
      disconnect: () => {},
      switchToBaseSepolia: async () => {},
    } as WalletContextType;
  }
  return context;
}
