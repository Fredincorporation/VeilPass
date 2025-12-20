'use client';

import React, { useEffect } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ThemeProvider } from './theme-context';
import { TranslationProvider } from './translation-context';
import { ReactQueryProvider } from './react-query';
import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from './wallet-config';

// Patch console.error immediately on module load, before React loads
if (typeof window !== 'undefined') {
  const originalError = console.error;
  let suppressNextError = false;

  (console as any).error = function(...args: any[]) {
    const message = String(args[0] || '');
    const stack = (args[0]?.stack || args[1] || '').toString();
    
    // Block these specific errors
    if (
      message.includes('Extra attributes from the server') ||
      message.includes('bis_skin_checked') ||
      message.includes('Ce:') ||
      message.includes('Unexpected error') ||
      stack.includes('evmAsk.js') ||
      stack.includes('proxy-injected-providers') ||
      stack.includes('getChainId') ||
      stack.includes('selectExtension') ||
      (Array.isArray(args[0]) && args[0].some?.((a: any) => 
        String(a || '').includes('Extra attributes') ||
        String(a || '').includes('bis_skin_checked')
      ))
    ) {
      // Silently suppress
      return;
    }
    
    // Pass through legitimate errors
    return originalError.apply(console, args);
  };
}

function ErrorFilter({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Additional safety net for any errors that slip through
    const handleError = (event: ErrorEvent) => {
      const message = event.message || '';
      
      if (
        message.includes('Ce:') ||
        message.includes('evmAsk') ||
        message.includes('bis_skin_checked')
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError, true);
    return () => window.removeEventListener('error', handleError, true);
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <NextThemeProvider attribute="class" defaultTheme="auto" enableSystem>
        <ThemeProvider>
          <TranslationProvider>
            <ReactQueryProvider>
              <ErrorFilter>
                {children}
              </ErrorFilter>
            </ReactQueryProvider>
          </TranslationProvider>
        </ThemeProvider>
      </NextThemeProvider>
    </WagmiConfig>
  );
}
