'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyPage() {
  const { t, language } = useLanguage();
  
  // Форматирование даты в зависимости от языка
  const dateLocale = language === 'uk' ? 'uk-UA' : language === 'ru' ? 'ru-RU' : 'en-US';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-8">
            🔒 {t.privacy.title}
          </h1>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              1. {t.privacy.data_collection_title}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>{t.privacy.data_collection_intro}</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>{t.privacy.data_email}</li>
                <li>{t.privacy.data_name}</li>
                <li>{t.privacy.data_progress}</li>
                <li>{t.privacy.data_ip}</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              2. {t.privacy.data_usage_title}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>{t.privacy.data_usage_intro}</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>{t.privacy.usage_access}</li>
                <li>{t.privacy.usage_progress}</li>
                <li>{t.privacy.usage_support}</li>
                <li>{t.privacy.usage_improve}</li>
              </ul>
              <p className="text-sm text-gray-400 mt-4">
                <strong>{t.privacy.no_third_party}</strong>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              3. {t.privacy.payment_info_title}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>🔒 {t.privacy.no_card_storage}</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>{t.privacy.payment_stripe}</li>
                <li>{t.privacy.payment_monobank}</li>
                <li>{t.privacy.payment_yookassa}</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              4. {t.privacy.data_protection_title}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>{t.privacy.protection_intro}</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>{t.privacy.protection_ssl}</li>
                <li>{t.privacy.protection_db}</li>
                <li>{t.privacy.protection_backup}</li>
                <li>{t.privacy.protection_2fa}</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              5. {t.privacy.your_rights_title}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>{t.privacy.rights_intro}</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>{t.privacy.rights_copy}</li>
                <li>{t.privacy.rights_delete}</li>
                <li>{t.privacy.rights_update}</li>
                <li>{t.privacy.rights_withdraw}</li>
              </ul>
              <p className="mt-4">
                {t.privacy.rights_contact}{' '}
                <a href="mailto:maksimmotok00000@gmail.com" className="text-purple-400 hover:underline">
                  maksimmotok00000@gmail.com
                </a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              6. {t.privacy.cookies_title}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>{t.privacy.cookies_intro}</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>{t.privacy.cookies_session}</li>
                <li>{t.privacy.cookies_analytics}</li>
                <li>{t.privacy.cookies_ux}</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              7. {t.privacy.contacts_title}
            </h2>
            <div className="text-gray-300 space-y-2">
              <p>
                {t.privacy.contacts_text}{' '}
                <a href="mailto:maksimmotok00000@gmail.com" className="text-purple-400 hover:underline">
                  maksimmotok00000@gmail.com
                </a>
              </p>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-500 text-center">
              {t.privacy.last_update} {new Date().toLocaleDateString(dateLocale)}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-purple-400 hover:text-purple-300 underline text-sm"
          >
            {t.privacy.back_home}
          </Link>
        </div>
      </div>
    </div>
  );
}
