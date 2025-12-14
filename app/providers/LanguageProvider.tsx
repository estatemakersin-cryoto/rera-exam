"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "mr";
type LangContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LangContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;
    
    const saved = localStorage.getItem("preferredLanguage");
    if (saved === "en" || saved === "mr") {
      setLanguage(saved);
    }
  }, []); // Empty dependency array - runs once on mount

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguageContext must be used inside Provider");
  return ctx;
}