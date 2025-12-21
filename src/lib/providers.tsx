'use client';

import React from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { ThemeProvider } from './theme-context';
import { TranslationProvider } from './translation-context';
import { ReactQueryProvider } from './react-query';
import { wagmiConfig } from './rainbowkit-config';
import '@rainbow-me/rainbowkit/styles.css';

// Patch console.warn and console.error to suppress known, non-critical warnings
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;

  (console as any).warn = function(...args: any[]) {
    const message = String(args[0] || '');
    
    // Suppress known non-critical warnings from wallet libraries and Web Components
    if (
      message.includes('WalletConnect Core is already initialized') ||
      message.includes('Multiple versions of Lit loaded') ||
      message.includes('Cannot redefine property: ethereum') ||
      message.includes('Lit is in dev mode')
    ) {
      return;
    }
    
    return originalWarn.apply(console, args);
  };

  (console as any).error = function(...args: any[]) {
    const message = String(args[0] || '');
    const stack = (args[0]?.stack || args[1] || '').toString();
    
    // Block these specific errors (known wallet extension warnings)
    if (
      message.includes('Extra attributes from the server') ||
      message.includes('bis_skin_checked') ||
      message.includes('Ce:') ||
      message.includes('Unexpected error') ||
      message.includes('Cannot redefine property: ethereum') ||
      stack.includes('evmAsk.js') ||
      stack.includes('proxy-injected-providers') ||
      stack.includes('getChainId') ||
      stack.includes('selectExtension') ||
      (Array.isArray(args[0]) && args[0].some?.((a: any) => 
        String(a || '').includes('Extra attributes') ||
        String(a || '').includes('bis_skin_checked')
      ))
    ) {
      return;
    }
    
    // Pass through legitimate errors
    return originalError.apply(console, args);
  };
}

function ErrorFilter({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const message = event.message || '';
      
      if (
        message.includes('Ce:') ||
        message.includes('evmAsk') ||
        message.includes('bis_skin_checked') ||
        message.includes('Cannot redefine property: ethereum')
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError, true);
    
    // Also handle uncaught rejections from wallet extensions
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = String(event.reason || '');
      if (message.includes('Cannot redefine property: ethereum')) {
        event.preventDefault();
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}

/**
 * Main Providers component that wraps the entire application
 * Provides: WagmiProvider → RainbowKitProvider → Theme → Translation → ReactQuery
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      {/* Ensure React Query client is available before RainbowKit which uses react-query hooks */}
      <ReactQueryProvider>
        <RainbowKitProvider>
          <NextThemeProvider attribute="class" defaultTheme="auto" enableSystem>
            <ThemeProvider>
              <TranslationProvider>
                <ErrorFilter>
                  {children}
                </ErrorFilter>
              </TranslationProvider>
            </ThemeProvider>
          </NextThemeProvider>
        </RainbowKitProvider>
      </ReactQueryProvider>
    </WagmiProvider>
  );
}
