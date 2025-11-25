'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function GoogleTranslate() {
  useEffect(() => {
    // Проверяем, не загружен ли уже скрипт
    if (document.getElementById('google-translate-script')) {
      return;
    }

    // Функция инициализации Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'ru', // Основной язык сайта - русский
            includedLanguages: 'ru,uk,en,de,pl,nl,ro,hu,fr,es,it,pt,tr,ar,zh-CN,ja,ko', // Доступные языки
            layout: (window.google.translate.TranslateElement as any).InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // Загружаем скрипт Google Translate
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      const scriptElement = document.getElementById('google-translate-script');
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, []);

  return (
    <div className="google-translate-container">
      <div id="google_translate_element"></div>
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
