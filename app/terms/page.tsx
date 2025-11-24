'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-8">
            📋 {t.terms.title}
          </h1>

          {/* О сервисе */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              1. {t.terms.about_service}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p><strong>AI Learning Platform</strong></p>
              <p>{t.terms.full_access_price}</p>
              <p><strong>{t.terms.whats_included}</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>{t.terms.all_courses_access}</li>
                <li>{t.terms.practice_tasks}</li>
                <li>{t.terms.lifetime_access}</li>
                <li>{t.terms.support_24_7}</li>
                <li>{t.terms.free_updates}</li>
              </ul>
            </div>
          </section>

          {/* Условия доступа */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              2. {t.terms.access_conditions}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>✅ {t.terms.instant_access}</p>
            </div>
          </section>

          {/* Возврат средств */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              3. {t.terms.refund_policy_title}
            </h2>
            <div className="text-gray-300 space-y-4">
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-green-400 mb-2">
                  ✅ {t.terms.refund_guarantee}
                </h3>
              </div>
            </div>
          </section>

          {/* Способы оплаты */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              4. {t.terms.payment_methods_title}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p><strong>{t.terms.we_accept}</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>🇺🇦 LiqPay (Visa, Mastercard, Приват24)</li>
                <li>🇷🇺 ЮКасса (СБП, МИР, Visa, Mastercard)</li>
                <li>🌍 Stripe (Visa, Mastercard, Amex)</li>
              </ul>
            </div>
          </section>

          {/* Контакты */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              5. {t.terms.contact_info_title}
            </h2>
            <div className="text-gray-300 space-y-2">
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:support@ai-learning45.com"
                  className="text-purple-400 hover:underline"
                >
                  support@ai-learning45.com
                </a>
              </p>
              <p><strong>{t.footer.support_24_7}</strong></p>
            </div>
          </section>
        </div>

        {/* Кнопка назад */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-purple-400 hover:text-purple-300 underline text-sm"
          >
            {t.terms.back_home}
          </Link>
        </div>
      </div>
    </div>
  );
}
