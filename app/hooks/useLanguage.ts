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

  // Load language from localStorage (CLIENT-SIDE ONLY)
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('preferredLanguage');
      if (saved === 'en' || saved === 'mr') {
        setLanguage(saved);
      }
    } catch (error) {
      console.error('Failed to load language preference:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Change language and notify all components
  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    
    // Safe localStorage access
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('preferredLanguage', newLanguage);
        
        window.dispatchEvent(
          new CustomEvent('languageChange', { detail: { language: newLanguage } })
        );
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
  };

  // React to language changes in other components
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ language: Language }>;
      if (customEvent.detail.language !== language) {
        setLanguage(customEvent.detail.language);
      }
    };

    window.addEventListener('languageChange', handler);

    return () => {
      window.removeEventListener('languageChange', handler);
    };
  }, [language]);

  // Translation function bound to current language
  const t = (key: string) => translationFunction(key, language);

  return {
    language,
    setLanguage: changeLanguage,
    t,
    isLoaded,
  };
}