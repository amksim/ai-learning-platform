import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Реквизиты | AI Learning Platform',
  description: 'Реквизиты самозанятой для платёжной системы',
};

export default function RequisitesPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Реквизиты самозанятой (НПД)
          </h1>
          
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
              <p className="text-lg font-semibold">Самозанятая</p>
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

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Данная информация предоставлена для верификации платёжной системы
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/"
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            ← Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  );
}
