import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 mt-auto mb-20 md:mb-0">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-3 md:gap-6 text-xs md:text-sm text-gray-400">
          <Link 
            href="/requisites"
            className="hover:text-white transition-colors font-medium"
          >
            📄 Реквизиты
          </Link>
          
          <span className="hidden md:inline text-gray-600">•</span>
          
          <p className="text-gray-500 text-center">
            © {new Date().getFullYear()} AI Learning Platform
          </p>
          
          <span className="hidden md:inline text-gray-600">•</span>
          
          <p className="text-gray-500 hidden md:block">
            Все права защищены
          </p>
        </div>
      </div>
    </footer>
  );
}
