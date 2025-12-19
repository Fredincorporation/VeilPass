'use client';

import React from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ThemeProvider } from './theme-context';
import { TranslationProvider } from './translation-context';
import { ReactQueryProvider } from './react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="auto" enableSystem>
      <ThemeProvider>
        <TranslationProvider>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </TranslationProvider>
      </ThemeProvider>
    </NextThemeProvider>
  );
}
