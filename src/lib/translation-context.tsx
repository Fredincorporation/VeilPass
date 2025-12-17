'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { detectLanguageFromIP, getSavedLanguage, setSavedLanguage } from '@/lib/language-detection';
import { translations, LanguageCode } from '@/lib/translations';

interface TranslationContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, defaultText?: string) => string;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language detection on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Check if user has saved preference
        const saved = getSavedLanguage();
        if (saved && saved in translations) {
          setLanguageState(saved as LanguageCode);
        } else {
          // Try IP detection first
          const ipLanguage = await detectLanguageFromIP();
          if (ipLanguage in translations) {
            setLanguageState(ipLanguage as LanguageCode);
            setSavedLanguage(ipLanguage);
          } else {
            setLanguageState('en');
          }
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        setLanguageState('en');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const setLanguage = (newLanguage: LanguageCode) => {
    setLanguageState(newLanguage);
    setSavedLanguage(newLanguage);
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLanguage;
    }
  };

  const t = (key: string, defaultText: string = key): string => {
    const langTranslations = translations[language];
    if (langTranslations && key in langTranslations) {
      return (langTranslations as any)[key];
    }
    // Fallback to English if translation not found
    if (language !== 'en') {
      const enTranslations = translations['en'];
      if (enTranslations && key in enTranslations) {
        return (enTranslations as any)[key];
      }
    }
    return defaultText;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
