import Link from 'next/link';

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-gray-800 bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
          <Link 
            href="/requisites"
            className="hover:text-white transition-colors"
          >
            Реквизиты
          </Link>
          
          <span className="text-gray-600">•</span>
          
          <p className="text-gray-500">
            © {new Date().getFullYear()} AI Learning Platform
          </p>
          
          <span className="text-gray-600">•</span>
          
          <p className="text-gray-500">
            Все права защищены
          </p>
        </div>
      </div>
    </footer>
  );
}
