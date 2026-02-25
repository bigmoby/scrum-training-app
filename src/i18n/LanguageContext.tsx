'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import it from './dictionaries/it.json';
import en from './dictionaries/en.json';

export type Language = 'it' | 'en';
type Dictionary = typeof it;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (section: keyof Dictionary, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries = {
  it,
  en,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('it');

  useEffect(() => {
    const saved = localStorage.getItem('scrum_lang') as Language;
    if (saved && (saved === 'it' || saved === 'en')) {
      setLangState(saved);
    } else {
      // Try to determine from browser, default to Italian
      const browserLang = navigator.language.split('-')[0];
      const defaultLang = browserLang === 'en' ? 'en' : 'it';
      setLangState(defaultLang);
      localStorage.setItem('scrum_lang', defaultLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('scrum_lang', newLang);
  };

  const t = (section: keyof Dictionary, key: string): string => {
    const dict = dictionaries[lang];
    if (dict && dict[section]) {
      // @ts-ignore
      return dict[section][key] || `${section}.${key}`;
    }
    return `${section}.${key}`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
