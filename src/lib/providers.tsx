'use client';

import React from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ThemeProvider } from './theme-context';
import { TranslationProvider } from './translation-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="auto" enableSystem>
      <ThemeProvider>
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </ThemeProvider>
    </NextThemeProvider>
  );
}
