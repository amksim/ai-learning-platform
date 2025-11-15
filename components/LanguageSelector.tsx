"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/translations";
import { languageNames } from "@/lib/autoTranslate";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: Language[] = [
    "ru", "en", "uk", "de", "pl", "nl", "ro", "hu"
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
      >
        <Globe className="h-4 w-4" />
        <span className="font-medium">{languageNames[language] || language.toUpperCase()}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
            <div className="p-2 grid grid-cols-2 gap-1">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                    language === lang
                      ? "bg-purple-600 text-white font-medium"
                      : "hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  {languageNames[lang] || lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
