"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { translations, Language } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.ru;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Deep merge function - объединяет объекты рекурсивно
// Приоритет: выбранный язык > английский > русский
function deepMerge<T extends Record<string, any>>(...objects: T[]): T {
  const result: any = {};
  
  for (const obj of objects) {
    if (!obj) continue;
    
    for (const key of Object.keys(obj)) {
      if (
        typeof obj[key] === 'object' && 
        obj[key] !== null && 
        !Array.isArray(obj[key])
      ) {
        result[key] = deepMerge(result[key] || {}, obj[key]);
      } else if (obj[key] !== undefined) {
        result[key] = obj[key];
      }
    }
  }
  
  return result;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ru");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      // Check if language is valid
      const validLanguages: Language[] = ["ru", "en", "uk", "de", "pl", "nl", "ro", "hu"];
      if (validLanguages.includes(savedLanguage as Language)) {
        setLanguage(savedLanguage as Language);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Создаем переводы с fallback:
  // 1. Русский (базовый, всегда полный)
  // 2. Английский (fallback для других языков)
  // 3. Выбранный язык (приоритетный)
  const mergedTranslations = useMemo(() => {
    const currentLangTranslations = (translations as any)[language];
    
    // Если русский - просто возвращаем русский
    if (language === 'ru') {
      return translations.ru;
    }
    
    // Если английский - мержим с русским как fallback
    if (language === 'en') {
      return deepMerge(translations.ru, translations.en);
    }
    
    // Для других языков: русский -> английский -> выбранный
    return deepMerge(translations.ru, translations.en, currentLangTranslations || {});
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: mergedTranslations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
