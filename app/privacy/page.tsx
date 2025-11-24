'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyPage() {
  const { t } = useLanguage();
  
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
              <p>Ми збираємо наступну інформацію:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Email адреса (для реєстрації та входу)</li>
                <li>Ім'я (опціонально)</li>
                <li>Дані про прогрес навчання</li>
                <li>IP-адреса та технічна інформація (для безпеки)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              2. {t.privacy.data_usage_title}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>Ваші дані використовуються для:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Надання доступу до курсів</li>
                <li>Відстеження прогресу навчання</li>
                <li>Технічної підтримки</li>
                <li>Покращення якості сервісу</li>
              </ul>
              <p className="text-sm text-gray-400 mt-4">
                <strong>Ми НЕ передаємо ваші дані третім особам</strong> без вашої згоди.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              3. {t.privacy.payment_info_title}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>
                🔒 {t.privacy.no_card_storage}
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Stripe (міжнародні платежі)</li>
                <li>LiqPay (Україна)</li>
                <li>ЮКassa (Росія)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              4. {t.privacy.data_protection_title}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>Ми використовуємо:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>SSL/TLS шифрування</li>
                <li>Захищені бази даних (Supabase)</li>
                <li>Регулярні backup копії</li>
                <li>Двофакторна автентифікація</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              5. {t.privacy.your_rights_title}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>Ви маєте право:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Отримати копію своїх даних</li>
                <li>Видалити свій акаунт</li>
                <li>Оновити персональну інформацію</li>
                <li>Відкликати згоду на обробку даних</li>
              </ul>
              <p className="mt-4">
                Для цього напишіть на: <a href="mailto:support@ai-learning45.com" className="text-purple-400 hover:underline">support@ai-learning45.com</a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              6. {t.privacy.cookies_title}
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>Ми використовуємо cookies для:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Збереження сесії входу</li>
                <li>Аналітики відвідувань</li>
                <li>Покращення користувацького досвіду</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              7. {t.privacy.contacts_title}
            </h2>
            <div className="text-gray-300 space-y-2">
              <p>
                З питань конфіденційності пишіть на:{' '}
                <a href="mailto:support@ai-learning45.com" className="text-purple-400 hover:underline">
                  support@ai-learning45.com
                </a>
              </p>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-500 text-center">
              Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}
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
