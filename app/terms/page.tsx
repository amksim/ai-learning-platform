import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Умови та повернення коштів | AI Learning Platform',
  description: 'Умови використання та політика повернення коштів',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-8">
            📋 Умови використання та повернення коштів
          </h1>

          {/* Про послугу */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              1. Про нашу послугу
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>
                <strong>AI Learning Platform</strong> надає доступ до онлайн-курсів з програмування, 
                створення сайтів, ігор та додатків за допомогою штучного інтелекту.
              </p>
              <p>
                <strong>Вартість повного доступу:</strong> $399 USD (одноразовий платіж)
              </p>
              <p>
                <strong>Що включено:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Доступ до всіх курсів (100+ уроків)</li>
                <li>Практичні завдання та проєкти</li>
                <li>Безстроковий доступ до матеріалів</li>
                <li>Технічна підтримка 24/7</li>
                <li>Оновлення курсів безкоштовно</li>
              </ul>
            </div>
          </section>

          {/* Доставка */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              2. Умови надання доступу
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>
                ✅ <strong>Доступ надається миттєво</strong> після успішної оплати
              </p>
              <p>
                ✅ Ви отримаєте email-підтвердження з інструкціями
              </p>
              <p>
                ✅ Доступ активується автоматично в особистому кабінеті
              </p>
              <p>
                ✅ Час активації: 1-5 хвилин після оплати
              </p>
            </div>
          </section>

          {/* Політика повернення */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              3. 💰 Політика повернення коштів
            </h2>
            <div className="text-gray-300 space-y-4">
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-green-400 mb-2">
                  ✅ 14-денна гарантія повернення коштів
                </h3>
                <p>
                  Ми впевнені в якості наших курсів! Якщо ви не задоволені курсом протягом 
                  перших 14 днів з моменту покупки, ми повернемо вам 100% вартості.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-white mt-6 mb-3">
                Умови повернення:
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Запит на повернення протягом 14 днів з дати покупки</li>
                <li>Ви переглянули менше 30% матеріалів курсу</li>
                <li>Надання причини повернення (опціонально, для покращення сервісу)</li>
              </ul>

              <h3 className="text-lg font-semibold text-white mt-6 mb-3">
                Як повернути кошти:
              </h3>
              <ol className="list-decimal list-inside ml-4 space-y-2">
                <li>Надішліть запит на email: <a href="mailto:support@ai-learning45.com" className="text-purple-400 hover:underline">support@ai-learning45.com</a></li>
                <li>Вкажіть email, з яким реєструвалися</li>
                <li>Опишіть причину (опціонально)</li>
                <li>Ми обробимо запит протягом 2-3 робочих днів</li>
                <li>Кошти повертаються на ту ж картку/рахунок протягом 5-10 робочих днів</li>
              </ol>

              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mt-4">
                <p className="text-yellow-300">
                  <strong>⚠️ Важливо:</strong> Після 14 днів або перегляду більше 30% матеріалів 
                  повернення коштів не здійснюється, оскільки доступ до курсу вже було надано.
                </p>
              </div>
            </div>
          </section>

          {/* Способи оплати */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              4. 💳 Способи оплати
            </h2>
            <div className="text-gray-300 space-y-3">
              <p><strong>Ми приймаємо:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>🇺🇦 <strong>LiqPay</strong> (для України): Visa, Mastercard, Приват24</li>
                <li>🇷🇺 <strong>ЮКassa</strong> (для Росії): СБП, карти МИР, Visa, Mastercard</li>
                <li>🌍 <strong>Stripe</strong> (міжнародні): Visa, Mastercard, American Express</li>
              </ul>
              <p className="text-sm text-gray-400">
                🔒 Всі платежі захищені та обробляються через надійні платіжні системи. 
                Ми не зберігаємо дані вашої карти.
              </p>
            </div>
          </section>

          {/* Контакти */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              5. 📞 Контактна інформація
            </h2>
            <div className="text-gray-300 space-y-2">
              <p>
                <strong>Email:</strong> <a href="mailto:support@ai-learning45.com" className="text-purple-400 hover:underline">support@ai-learning45.com</a>
              </p>
              <p>
                <strong>Підтримка:</strong> 24/7 (відповідаємо протягом 24 годин)
              </p>
              <p>
                <strong>Сайт:</strong> <a href="https://ai-learning45.netlify.app" className="text-purple-400 hover:underline">https://ai-learning45.netlify.app</a>
              </p>
            </div>
          </section>

          {/* Реквизиты */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              6. 🏢 Реквізити
            </h2>
            <div className="text-gray-300 space-y-2">
              <p>
                Повні реквізити можна переглянути на сторінці:{' '}
                <Link href="/requisites" className="text-purple-400 hover:underline">
                  Реквізити
                </Link>
              </p>
            </div>
          </section>

          {/* Останнє оновлення */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-500 text-center">
              Останнє оновлення: {new Date().toLocaleDateString('uk-UA')}
            </p>
          </div>
        </div>

        {/* Кнопка назад */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-purple-400 hover:text-purple-300 underline text-sm"
          >
            ← Повернутися на головну
          </Link>
        </div>
      </div>
    </div>
  );
}
