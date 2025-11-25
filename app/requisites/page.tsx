'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RequisitesPage() {
  const { t, language } = useLanguage();
  
  // Определяем какие реквизиты показывать в зависимости от языка
  const showUkraine = language === 'uk';
  const showRussia = language === 'ru';
  const showInternational = !showUkraine && !showRussia; // Для всех остальных языков
  
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          📄 {t.requisites.title}
        </h1>

        {/* УКРАИНА (LiqPay) - показываем только для украинского языка */}
        {showUkraine && (
          <div className="bg-gradient-to-br from-yellow-50 to-blue-50 border-2 border-yellow-400 rounded-lg p-8 shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-4xl">🇺🇦</span>
              <h2 className="text-3xl font-bold text-gray-900">
                {t.requisites.ukraine_liqpay}
              </h2>
              <span className="ml-4 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                {t.requisites.main_badge}
              </span>
            </div>
            
            <div className="space-y-4 text-gray-800 max-w-2xl mx-auto">
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm text-gray-600 mb-1">{t.requisites.fop_full_name}</p>
                <p className="text-lg font-semibold text-blue-900">Моток Максим Артурович</p>
              </div>
              
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm text-gray-600 mb-1">{t.requisites.edrpou_ipn}</p>
                <p className="text-lg font-semibold text-blue-900">3728309157</p>
              </div>
              
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm text-gray-600 mb-1">{t.requisites.status_label}</p>
                <p className="text-lg font-semibold text-blue-900">{t.requisites.fop_status_value}</p>
              </div>
              
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm text-gray-600 mb-1">{t.requisites.registration_address}</p>
                <p className="text-lg font-semibold text-blue-900">Україна, Одеська обл., Болградський р-н, с. Лісне, вул. Манзирська, буд. 15</p>
              </div>
              
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm text-gray-600 mb-1">{t.requisites.city_label}</p>
                <p className="text-lg font-semibold text-blue-900">с. Лісне, Болградський район, Одеська область</p>
              </div>
              
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm text-gray-600 mb-1">{t.requisites.phone_label}</p>
                <p className="text-lg font-semibold text-blue-900">+44 740 418 0061</p>
              </div>
              
              <div className="pb-3">
                <p className="text-sm text-gray-600 mb-1">{t.requisites.email_label}</p>
                <p className="text-lg font-semibold text-blue-900">maksimmotok00000@gmail.com</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-center text-green-800 font-medium">
                💳 {t.requisites.liqpay_payment_info}
              </p>
            </div>
          </div>
        )}

        {/* РОССИЯ (YooKassa) - показываем только для русского языка */}
        {showRussia && (
          <div className="bg-gradient-to-br from-red-50 to-blue-50 border-2 border-red-400 rounded-lg p-8 shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-4xl">🇷🇺</span>
              <h2 className="text-3xl font-bold text-gray-900">
                {t.requisites.russia_additional}
              </h2>
            </div>
            
            <div className="space-y-4 text-gray-800 max-w-2xl mx-auto">
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm text-gray-600 mb-1">ФИО:</p>
                <p className="text-lg font-semibold text-red-900">Аверина Зарина Акимовна</p>
              </div>
              
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm text-gray-600 mb-1">ИНН:</p>
                <p className="text-lg font-semibold text-red-900">025509808226</p>
              </div>
              
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm text-gray-600 mb-1">Статус:</p>
                <p className="text-lg font-semibold text-red-900">Самозанятая (НПД)</p>
              </div>
              
              <div className="border-b border-gray-300 pb-3">
                <p className="text-sm text-gray-600 mb-1">Телефон:</p>
                <p className="text-lg font-semibold text-red-900">+7 982 221 93 44</p>
              </div>
              
              <div className="pb-3">
                <p className="text-sm text-gray-600 mb-1">Email:</p>
                <p className="text-lg font-semibold text-red-900">zarina_averina@mail.ru</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-100 border border-purple-300 rounded-lg">
              <p className="text-center text-purple-800 font-medium">
                💳 Для оплаты через СБП и YooKassa
              </p>
            </div>
          </div>
        )}

        {/* МЕЖДУНАРОДНЫЕ (Stripe) - показываем для всех остальных языков */}
        {showInternational && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400 rounded-lg p-8 shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-4xl">🌍</span>
              <h2 className="text-3xl font-bold text-gray-900">
                International Payment (Stripe)
              </h2>
            </div>
            
            <div className="space-y-4 text-gray-800 max-w-2xl mx-auto text-center">
              <p className="text-lg">
                🔒 Secure international payments via <strong>Stripe</strong>
              </p>
              <p className="text-gray-600">
                We accept all major credit cards worldwide
              </p>
              
              <div className="grid grid-cols-3 gap-4 my-6">
                <div className="p-4 bg-white rounded-lg shadow">
                  <p className="font-bold">Visa</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow">
                  <p className="font-bold">Mastercard</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow">
                  <p className="font-bold">Amex</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-center text-green-800 font-medium">
                💳 Payments processed securely by Stripe
              </p>
            </div>
          </div>
        )}

        {/* Информация о компании */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            🏢 {t.requisites.company_title}
          </h3>
          <div className="text-gray-700 space-y-2 text-center">
            <p><strong>{t.requisites.website_label}</strong> https://ai-learning45.netlify.app</p>
            <p><strong>{t.requisites.support_email_label}</strong> support@ai-learning45.com</p>
            <p><strong>{t.requisites.activity_type_label}</strong> {t.requisites.activity_description}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            {t.requisites.verification_notice}
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
          >
            {t.requisites.back_home}
          </Link>
        </div>
      </div>
    </div>
  );
}
