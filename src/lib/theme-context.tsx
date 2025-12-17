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

  const setThemeMode = (mode: 'light' | 'dark' | 'auto') => {
    localStorage.setItem('theme-mode', mode);
    setTheme(mode);
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
