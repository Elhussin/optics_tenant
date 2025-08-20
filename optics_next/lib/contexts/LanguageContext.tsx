'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, LANGUAGES } from '@/types/pages';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  direction: 'ltr' | 'rtl';
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  defaultLanguage = 'en' 
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage);

  useEffect(() => {
    // Load language from localStorage or browser preference
    const savedLanguage = localStorage.getItem('language') as Language;
    const browserLanguage = navigator.language.startsWith('ar') ? 'ar' : 'en';
    
    if (savedLanguage && Object.keys(LANGUAGES).includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      setCurrentLanguage(browserLanguage);
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
    
    // Update HTML direction
    document.documentElement.dir = LANGUAGES[language].dir;
    document.documentElement.lang = language;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    direction: LANGUAGES[currentLanguage].dir,
    availableLanguages: Object.keys(LANGUAGES) as Language[],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};