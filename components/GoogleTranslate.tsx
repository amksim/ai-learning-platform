'use client';

import { useEffect, useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

const languages = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function GoogleTranslate() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('ru');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Проверяем, не загружен ли уже скрипт
    if (document.getElementById('google-translate-script')) {
      setIsLoaded(true);
      return;
    }

    // Функция инициализации Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'ru',
            includedLanguages: 'ru,uk,en,de,pl,nl,ro,hu,fr,es',
            layout: (window.google.translate.TranslateElement as any).InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
        setIsLoaded(true);
      }
    };

    // Загружаем скрипт Google Translate
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Таймаут для fallback
    setTimeout(() => setIsLoaded(true), 3000);

    return () => {
      const scriptElement = document.getElementById('google-translate-script');
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, []);

  const selectLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // Пытаемся использовать Google Translate
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = langCode;
      selectElement.dispatchEvent(new Event('change'));
    } else {
      // Fallback - используем cookie для Google Translate
      document.cookie = `googtrans=/ru/${langCode}; path=/`;
      document.cookie = `googtrans=/ru/${langCode}; path=/; domain=${window.location.hostname}`;
      window.location.reload();
    }
  };

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="google-translate-container relative">
      {/* Скрытый элемент Google Translate */}
      <div id="google_translate_element" className="hidden"></div>
      
      {/* Красивый кастомный dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-all"
        >
          <Globe className="h-4 w-4 text-purple-400" />
          <span className="text-sm">{currentLanguage.flag}</span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors text-left ${
                  currentLang === lang.code ? 'bg-purple-500/20 text-purple-400' : 'text-gray-300'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm">{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <style jsx global>{`
        /* Скрываем оригинальный баннер Google Translate */
        .goog-te-banner-frame {
          display: none !important;
        }
        
        body {
          top: 0 !important;
        }
        
        /* Стилизуем выпадающий список */
        .goog-te-gadget {
          font-family: inherit !important;
        }
        
        .goog-te-gadget-simple {
          background-color: #1f2937 !important;
          border: 1px solid #374151 !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          font-size: 14px !important;
          cursor: pointer !important;
        }
        
        .goog-te-gadget-simple span {
          color: #e5e7eb !important;
        }
        
        .goog-te-gadget-simple .goog-te-menu-value span:first-child {
          display: none !important;
        }
        
        .goog-te-gadget-icon {
          display: none !important;
        }
        
        .goog-te-menu-value {
          color: #e5e7eb !important;
        }
        
        .goog-te-menu-value:hover {
          color: #fff !important;
        }
        
        /* Убираем подчёркивание после перевода */
        .goog-te-combo {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
          border: 1px solid #374151 !important;
          border-radius: 6px !important;
          padding: 6px 10px !important;
          font-size: 13px !important;
          outline: none !important;
        }
        
        /* Скрываем "Powered by Google" */
        .goog-logo-link {
          display: none !important;
        }
        
        .goog-te-gadget > span {
          display: none !important;
        }
        
        /* Убираем рамки при переводе */
        .translated-ltr, .translated-rtl {
          border: none !important;
          box-shadow: none !important;
        }
        
        font[style] {
          background-color: transparent !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}
