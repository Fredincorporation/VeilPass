'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTheme } from 'next-themes';

interface ThemeContextType {
  theme: string;
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme-mode') || 'auto';
    setThemeMode(savedTheme as 'light' | 'dark' | 'auto');
  }, []);

  const setThemeMode = async (mode: 'light' | 'dark' | 'auto') => {
    localStorage.setItem('theme-mode', mode);
    setTheme(mode);
    
    // Save to database if user is logged in
    const account = localStorage.getItem('veilpass_account');
    if (account) {
      try {
        await fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_address: account,
            theme_preference: mode,
          }),
        });
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  };

  const value: ThemeContextType = {
    theme: theme || 'auto',
    setThemeMode,
    mounted,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}
