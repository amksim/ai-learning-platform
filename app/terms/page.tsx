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
              1. О нашей услуге
            </h2>
            <div className="text-gray-300 space-y-3">
              <p><strong>AI Learning Platform</strong></p>
              <p>💰 <strong>Стоимость полного доступа: $249.99 USD</strong> (одноразовый платеж)</p>
              <p><strong>Что включено:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Доступ ко всем 4 курсам (100+ уроков)</li>
                <li>Практические задания и проекты</li>
                <li>Бессрочный доступ к материалам</li>
                <li>Техподдержка 24/7</li>
                <li>Бесплатные обновления курсов</li>
              </ul>
            </div>
          </section>

          {/* Скидка за рекламу */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-green-400 mb-4">
              🎬 2. Скидка за рекламу — $179!
            </h2>
            <div className="text-gray-300 space-y-3">
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <p className="text-green-400 font-semibold mb-3">
                  💡 Получи скидку $70 — заплати только $179 вместо $249.99!
                </p>
                <p className="mb-3"><strong>Как получить скидку:</strong></p>
                <ol className="list-decimal list-inside ml-4 space-y-2">
                  <li>Сними видео-рекламу нашего курса</li>
                  <li>Опубликуй на YouTube, TikTok или Instagram</li>
                  <li>Набери <strong>1000+ просмотров</strong></li>
                  <li>Пришли ссылку на видео нам на email</li>
                  <li>Получи курс за <strong>$179</strong>!</li>
                </ol>
              </div>
              <p className="text-sm text-gray-400">
                * Видео должно быть оригинальным и содержать информацию о нашей платформе AI Learning.
              </p>
            </div>
          </section>

          {/* Условия доступа */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              3. Условия предоставления доступа
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>✅ Доступ предоставляется мгновенно после успешной оплаты</p>
            </div>
          </section>

          {/* Условия получения услуги / Доставка */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              4. Условия получения услуги
            </h2>
            <div className="text-gray-300 space-y-3">
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <p className="text-blue-400 font-semibold mb-2">📦 Это онлайн-курс. Физическая доставка не требуется.</p>
              </div>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>✅ Доступ к материалам открывается мгновенно после оплаты</li>
                <li>♾️ Доступ предоставляется навсегда (бессрочно)</li>
                <li>🌍 Доступ с любого устройства в любой точке мира</li>
              </ul>
            </div>
          </section>

          {/* Возврат средств */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              5. Политика возврата средств
            </h2>
            <div className="text-gray-300 space-y-4">
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-yellow-400 mb-3">
                  ⚠️ Условия возврата
                </h3>
                <p className="mb-3">
                  Возврат средств возможен <strong>только</strong> в случае, если вы не можете создать проект по нашим урокам, 
                  несмотря на выполнение всех инструкций.
                </p>
                <p className="mb-3"><strong>Для получения возврата необходимо:</strong></p>
                <ol className="list-decimal list-inside ml-4 space-y-2">
                  <li>Пройти минимум 10 уроков курса</li>
                  <li>Связаться с нашей поддержкой</li>
                  <li>Показать, что вы следовали инструкциям, но результат не получился</li>
                  <li>Наша команда проверит вашу ситуацию в течение 48 часов</li>
                </ol>
              </div>
              <p className="text-sm text-gray-400">
                * Возврат не предоставляется, если вы просто передумали или не начали обучение.
              </p>
            </div>
          </section>

          {/* Способы оплаты */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              6. Способы оплаты
            </h2>
            <div className="text-gray-300 space-y-3">
              <p><strong>{t.terms.we_accept}</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>🇺🇦 {t.terms.payment_liqpay}</li>
                <li>🇷🇺 {t.terms.payment_yookassa}</li>
                <li>🌍 {t.terms.payment_stripe}</li>
              </ul>
            </div>
          </section>

          {/* Контакты */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              7. Контактная информация
            </h2>
            <div className="text-gray-300 space-y-2">
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:maksimmotok00000@gmail.com"
                  className="text-purple-400 hover:underline"
                >
                  maksimmotok00000@gmail.com
                </a>
              </p>
              <p>
                <strong>{t.requisites.phone_label}</strong>{' '}
                <a
                  href="tel:+447404180061"
                  className="text-purple-400 hover:underline"
                >
                  +44 740 418 0061
                </a>
              </p>
              <p><strong>🕐 {t.footer.support_24_7}</strong></p>
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
