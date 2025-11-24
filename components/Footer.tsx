'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="border-t border-gray-800 bg-gray-900 mt-auto mb-20 md:mb-0">
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Основные ссылки */}
        <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm text-gray-400 mb-3">
          <Link 
            href="/requisites"
            className="hover:text-white transition-colors font-medium"
          >
            📄 {t.footer.requisites}
          </Link>
          
          <span className="hidden md:inline text-gray-600">•</span>
          
          <Link 
            href="/terms"
            className="hover:text-white transition-colors"
          >
            📋 {t.footer.terms}
          </Link>
          
          <span className="hidden md:inline text-gray-600">•</span>
          
          <Link 
            href="/privacy"
            className="hover:text-white transition-colors"
          >
            🔒 {t.footer.privacy_policy}
          </Link>
        </div>

        {/* Контакты */}
        <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-2 md:gap-4 text-xs text-gray-500 mb-3">
          <a href="mailto:support@ai-learning45.com" className="hover:text-white transition-colors">
            📧 {t.footer.support_email}
          </a>
          <span className="hidden md:inline text-gray-600">•</span>
          <span>☎️ {t.footer.support_24_7}</span>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} AI Learning Platform. {t.footer.copyright}.
          </p>
        </div>
      </div>
    </footer>
  );
}
