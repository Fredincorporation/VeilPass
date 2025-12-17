"use client";

import React, { useEffect, useState } from 'react';
import { isMobileDevice } from './wallet-config';

// Lightweight dynamic wrapper around Coinbase OnchainKit + Wallet SDK.
// Uses dynamic imports so the dev server won't crash if packages are missing.
// This wrapper will attempt to initialize the provider and fall back to a noop provider.

export function CoinbaseOnchainKitProvider({ children }: { children: React.ReactNode }) {
  const [Provider, setProvider] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // dynamic import so build doesn't fail if package isn't installed yet
        const onchainkit = await import('@coinbase/onchainkit');
        const walletSdkModule = await import('@coinbase/wallet-sdk');

        // Best-effort: try to construct Wallet SDK and pass into OnchainKit provider
        // API shapes may vary; we attempt a safe instantiation and pass options as 'any'.
        const WalletSDKClass: any = (walletSdkModule && (walletSdkModule.default || walletSdkModule.WalletSDK || walletSdkModule)) as any;

        let walletSdkInstance: any = null;
        try {
          walletSdkInstance = new WalletSDKClass({
            // clientId can be provided via env; keep empty fallback
            clientId: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID || '',
            // Force smart wallet flow on mobile
            smartWalletOnly: isMobileDevice(),
          });
        } catch (err) {
          // If instantiation fails, continue without walletSdk instance
          console.warn('Could not instantiate Wallet SDK (non-fatal)', err);
        }

        // Prefer exported provider names, fall back to default export
        const OnchainKitProvider: any = onchainkit?.OnchainKitProvider || onchainkit?.default || null;

        if (mounted && OnchainKitProvider) {
          // Wrap provider to inject walletSdkInstance if provider accepts props
          const WrappedProvider: React.FC<any> = ({ children: innerChildren }) => (
            // @ts-ignore - pass options as any to avoid strict typing issues
            <OnchainKitProvider walletSdk={walletSdkInstance} chainId={84532}>
              {innerChildren}
            </OnchainKitProvider>
          );
          setProvider(() => WrappedProvider);
        }
      } catch (e) {
        // If import fails, do not block the app — warn and continue with no-op provider
        console.warn('Coinbase OnchainKit dynamic import failed (skipping).', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!Provider) {
    // no-op: return children directly until provider is available
    return <>{children}</>;
  }

  const P = Provider;
  return <P>{children}</P>;
}

export default CoinbaseOnchainKitProvider;
