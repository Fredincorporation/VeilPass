'use client';

import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '@/lib/translation-context';
import { getLanguageLabel } from '@/lib/language-detection';
import { translations } from '@/lib/translations';

export function LanguageSelector() {
  const { language, setLanguage, isLoading } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = Object.keys(translations) as Array<keyof typeof translations>;

  if (isLoading) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        title={`Current language: ${getLanguageLabel(language)}`}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-semibold uppercase">{language}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 shadow-xl z-50 overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {languages.map(lang => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center justify-between transition ${
                  language === lang
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>{getLanguageLabel(lang)}</span>
                {language === lang && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
