'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const checkCountRef = useRef(0);

  useEffect(() => {
    // При загрузке/смене страницы
    setIsLoading(true);
    setIsVisible(true);
    checkCountRef.current = 0;

    // Функция проверки что контент загружен
    const checkContentLoaded = () => {
      // Проверяем что нет скелетонов и спиннеров (кроме самого лоадера)
      const mainContent = document.querySelector('main');
      if (!mainContent) return false;
      
      // Ищем скелетоны только внутри main (не считая лоадер)
      const hasSkeletons = mainContent.querySelectorAll('[class*="skeleton"], .loading').length > 0;
      const hasSpinners = mainContent.querySelectorAll('[class*="animate-spin"]').length > 0;
      const hasContent = mainContent.children.length > 0;
      
      // Считаем загруженные картинки внутри main
      const images = mainContent.querySelectorAll('img');
      let allImagesLoaded = true;
      images.forEach(img => {
        if (!img.complete && img.src) {
          allImagesLoaded = false;
        }
      });

      return !hasSkeletons && !hasSpinners && hasContent && allImagesLoaded;
    };

    // Функция завершения загрузки
    const finishLoading = () => {
      setIsLoading(false);
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    };

    // Проверяем каждые 100ms пока контент не загрузится
    const checkInterval = setInterval(() => {
      checkCountRef.current++;
      
      // Минимум 600ms показываем загрузку
      if (checkCountRef.current < 6) return;
      
      // Проверяем загружен ли контент
      if (checkContentLoaded()) {
        clearInterval(checkInterval);
        finishLoading();
      }
      
      // Максимум 5 секунд ждём, потом всё равно скрываем
      if (checkCountRef.current > 50) {
        clearInterval(checkInterval);
        finishLoading();
      }
    }, 100);

    // Также слушаем window.load как fallback
    const handleLoad = () => {
      // Дополнительная проверка через 800ms после load
      setTimeout(() => {
        if (checkContentLoaded()) {
          clearInterval(checkInterval);
          finishLoading();
        }
      }, 800);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('load', handleLoad);
    };
  }, [pathname]);

  // При навигации показываем снова
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.target && !link.download) {
        const url = new URL(link.href);
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          setIsLoading(true);
          setIsVisible(true);
          checkCountRef.current = 0;
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0f0f1a 100%)'
      }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main loader */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Spinning rings with brain */}
        <div className="relative w-28 h-28">
          {/* Outer ring */}
          <div 
            className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
            style={{ 
              borderTopColor: '#a855f7',
              borderRightColor: '#ec4899',
              animationDuration: '1.5s'
            }}
          />
          {/* Inner ring */}
          <div 
            className="absolute inset-3 rounded-full border-4 border-transparent animate-spin"
            style={{ 
              borderBottomColor: '#3b82f6',
              borderLeftColor: '#06b6d4',
              animationDuration: '1s',
              animationDirection: 'reverse'
            }}
          />
          {/* Brain icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl animate-pulse">🧠</span>
          </div>
        </div>

        {/* Logo text */}
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            AI Learning Platform
          </h2>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="text-gray-400">Загрузка</span>
            <span className="text-purple-400 animate-bounce" style={{ animationDelay: '0s' }}>.</span>
            <span className="text-pink-400 animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
            <span className="text-blue-400 animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full animate-loading-bar"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 100%; margin-left: 0%; }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
