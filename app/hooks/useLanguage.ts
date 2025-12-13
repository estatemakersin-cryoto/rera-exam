// ============================================
// FILE: app/hooks/useLanguage.ts
// ACTION: CREATE OR REPLACE FILE
// PURPOSE: Manage language + provide translation function
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { t as translationFunction } from '@/lib/translations';

export type Language = 'en' | 'mr';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved === 'en' || saved === 'mr') {
      setLanguage(saved);
    }
    setIsLoaded(true);
  }, []);

  // Change language and notify all components
  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);

    window.dispatchEvent(
      new CustomEvent('languageChange', { detail: { language: newLanguage } })
    );
  };

  // React to language changes in other components
  useEffect(() => {
    const handler = (event: CustomEvent) => {
      if (event.detail.language !== language) {
        setLanguage(event.detail.language);
      }
    };

    window.addEventListener('languageChange', handler as EventListener);

    return () => {
      window.removeEventListener('languageChange', handler as EventListener);
    };
  }, [language]);

  // ❗ Translation function bound to current language
  const t = (key: string) => translationFunction(key, language);

  return {
    language,
    setLanguage: changeLanguage,
    t,
    isLoaded,
  };
}
