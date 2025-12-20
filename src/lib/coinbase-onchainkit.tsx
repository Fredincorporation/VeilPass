"use client";

import React, { useEffect, useState } from 'react';
import { isMobileDevice, validateCDPApiKey } from './wallet-config';

// Lightweight dynamic wrapper around Coinbase OnchainKit + Wallet SDK.
// Uses dynamic imports so the dev server won't crash if packages are missing.
// This wrapper will attempt to initialize the provider and fall back to a noop provider.

export function CoinbaseOnchainKitProvider({ children }: { children: React.ReactNode }) {
  const [Provider, setProvider] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Validate CDP API Key first
        if (!validateCDPApiKey()) {
          setError('NEXT_PUBLIC_COINBASE_CDP_API_KEY is not set. Please add it to your .env.local file.');
          return;
        }

        // Dynamic import so build doesn't fail if package isn't installed yet
        const onchainkit: any = await import('@coinbase/onchainkit');
        const walletSdkModule: any = await import('@coinbase/wallet-sdk');

        // Best-effort: try to construct Wallet SDK and pass into OnchainKit provider
        // API shapes may vary; we attempt a safe instantiation and pass options as 'any'.
        const WalletSDKClass: any = (walletSdkModule && (walletSdkModule.default || walletSdkModule.WalletSDK || walletSdkModule)) as any;

        let walletSdkInstance: any = null;
        try {
          // Create Wallet SDK instance with proper configuration
          walletSdkInstance = new WalletSDKClass({
            // Required: CDP API Key from environment
            apiKey: process.env.NEXT_PUBLIC_COINBASE_CDP_API_KEY || '',
            // Force smart wallet only on mobile for embedded experience
            smartWalletOnly: isMobileDevice(),
            // App metadata
            appName: 'VeilPass',
            appLogoUrl: '/logo.svg',
            // Network configuration
            defaultChainId: 84532, // Base Sepolia
            theme: 'dark',
          });

          console.log('✅ Coinbase Wallet SDK initialized successfully');
          console.log('📱 Mobile device:', isMobileDevice());
          console.log('🔐 Smart wallet only:', isMobileDevice());

        } catch (err) {
          console.warn('⚠️ Could not instantiate Wallet SDK (non-fatal)', err);
          setError('Failed to initialize Wallet SDK. Please check your CDP API Key.');
        }

        // Prefer exported provider names, fall back to default export
        const OnchainKitProvider: any = onchainkit?.OnchainKitProvider || onchainkit?.default || null;

        if (mounted && OnchainKitProvider) {
          // Wrap provider with minimal configuration
          const WrappedProvider: React.FC<any> = ({ children: innerChildren }) => (
            // @ts-ignore - pass options as any to avoid strict typing issues
            <OnchainKitProvider 
              chainId={84532} // Base Sepolia
              apiKey={process.env.NEXT_PUBLIC_COINBASE_CDP_API_KEY || ''}
            >
              {innerChildren}
            </OnchainKitProvider>
          );
          setProvider(() => WrappedProvider);
        }
      } catch (e) {
        // If import fails, do not block the app — warn and continue with no-op provider
        console.warn('⚠️ Coinbase OnchainKit dynamic import failed (skipping).', e);
        setError('Failed to load Coinbase OnchainKit. Please install @coinbase/onchainkit and @coinbase/wallet-sdk.');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    console.error('❌ Coinbase Wallet integration error:', error);
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-red-600 dark:text-red-400 font-semibold mb-2">Wallet Integration Error</h3>
        <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
        <p className="text-red-500 dark:text-red-300 text-xs mt-2">
          Please check your .env.local file and ensure NEXT_PUBLIC_COINBASE_CDP_API_KEY is set.
        </p>
      </div>
    );
  }

  if (!Provider) {
    // no-op: return children directly until provider is available
    return <>{children}</>;
  }

  const P = Provider;
  return <P>{children}</P>;
}

export default CoinbaseOnchainKitProvider;
