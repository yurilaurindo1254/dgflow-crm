"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import pt from '../locales/pt.json';
import en from '../locales/en.json';
import es from '../locales/es.json';

type Language = 'pt' | 'en' | 'es';
type Currency = 'BRL' | 'USD' | 'EUR';

const translations = { pt, en, es };

interface SettingsContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('dgflow_lang') as Language) || 'pt';
    }
    return 'pt';
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('dgflow_curr') as Currency) || 'BRL';
    }
    return 'BRL';
  });

  useEffect(() => {
    localStorage.setItem('dgflow_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('dgflow_curr', currency);
  }, [currency]);

  type TranslationNode = string | { [key: string]: TranslationNode };

  const t = (path: string) => {
    const keys = path.split('.');
    let current: TranslationNode = translations[language] as TranslationNode;
    
    for (const key of keys) {
      if (typeof current === 'string' || current[key] === undefined) return path;
      current = current[key];
    }
    
    return typeof current === 'string' ? current : path;
  };

  return (
    <SettingsContext.Provider value={{ language, currency, setLanguage, setCurrency, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
