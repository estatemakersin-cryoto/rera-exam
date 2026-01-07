'use client';

import { useState, useEffect } from 'react';
import { t as translationFunction } from '@/lib/translations';

export type Language = 'en' | 'mr';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en');

  // Load language ONCE on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const saved = localStorage.getItem('preferredLanguage');
    if (saved === 'en' || saved === 'mr') {
      setLanguage(saved);
    }
  }, []); // ⚠️ EMPTY array - runs ONCE

  // Change language
  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    
    if (typeof window !== "undefined") {
      localStorage.setItem('preferredLanguage', newLanguage);
    }
  };

  // Translation function
  const t = (key: string) => translationFunction(key, language);

  return {
    language,
    setLanguage: changeLanguage,
    t,
  };
}