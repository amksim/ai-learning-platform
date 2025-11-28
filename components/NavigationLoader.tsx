'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true); // Начинаем с загрузки!
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // При первой загрузке/обновлении страницы
    setIsLoading(true);
    setIsVisible(true);

    // Ждём полной загрузки страницы (все картинки, шрифты, стили)
    const handleLoad = () => {
      // Небольшая задержка для плавности
      setTimeout(() => {
        setIsLoading(false);
        // Анимация исчезновения
        setTimeout(() => {
          setIsVisible(false);
        }, 300);
      }, 500); // Минимум 500ms показываем загрузку
    };

    // Проверяем, загружена ли страница уже
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [pathname]); // При смене страницы тоже показываем

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
