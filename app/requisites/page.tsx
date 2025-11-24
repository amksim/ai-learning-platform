import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Реквизиты | AI Learning Platform',
  description: 'Реквизиты самозанятой для платёжной системы',
};

export default function RequisitesPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          📄 Реквізити / Реквизиты
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Россия - YooKassa */}
          <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🇷🇺</span>
              <h2 className="text-2xl font-bold text-gray-900">
                Россия (YooKassa)
              </h2>
            </div>
            
            <div className="space-y-4 text-gray-800">
              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600 mb-1">ФИО:</p>
                <p className="text-lg font-semibold">Аверина Зарина Акимовна</p>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600 mb-1">ИНН:</p>
                <p className="text-lg font-semibold">025509808226</p>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600 mb-1">Статус:</p>
                <p className="text-lg font-semibold">Самозанятая (НПД)</p>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600 mb-1">Адрес:</p>
                <p className="text-lg font-semibold">Россия (адрес регистрации НПД)</p>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600 mb-1">Телефон:</p>
                <p className="text-lg font-semibold">+7 982 221 93 44</p>
              </div>
              
              <div className="pb-3">
                <p className="text-sm text-gray-600 mb-1">Email:</p>
                <p className="text-lg font-semibold">zarina_averina@mail.ru</p>
              </div>
            </div>
          </div>

          {/* Украина - LiqPay */}
          <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🇺🇦</span>
              <h2 className="text-2xl font-bold text-gray-900">
                Україна (LiqPay)
              </h2>
            </div>
            
            <div className="space-y-4 text-gray-800">
              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600 mb-1">ФОП:</p>
                <p className="text-lg font-semibold">[Ваше ім'я та прізвище]</p>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600 mb-1">ЄДРПОУ/ІПН:</p>
                <p className="text-lg font-semibold">[Ваш ІПН]</p>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600 mb-1">Статус:</p>
                <p className="text-lg font-semibold">ФОП (Фізична особа-підприємець)</p>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600 mb-1">Адреса:</p>
                <p className="text-lg font-semibold">[Адреса реєстрації ФОП]</p>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <p className="text-sm text-gray-600 mb-1">Телефон:</p>
                <p className="text-lg font-semibold">[Ваш телефон]</p>
              </div>
              
              <div className="pb-3">
                <p className="text-sm text-gray-600 mb-1">Email:</p>
                <p className="text-lg font-semibold">[Ваш email]</p>
              </div>
            </div>
          </div>
        </div>

        {/* Информация о компании */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            🏢 AI Learning Platform
          </h3>
          <div className="text-gray-700 space-y-2 text-center">
            <p><strong>Сайт:</strong> https://ai-learning45.netlify.app</p>
            <p><strong>Email підтримки:</strong> support@ai-learning45.com</p>
            <p><strong>Вид діяльності:</strong> Освітні онлайн-курси з програмування та AI</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Дані надані для верифікації платіжних систем YooKassa та LiqPay
          </p>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            ← Повернутися на головну / Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  );
}
