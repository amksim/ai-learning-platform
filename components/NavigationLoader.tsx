'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

// Настройки NProgress
NProgress.configure({ 
  showSpinner: false,
  minimum: 0.1,
  speed: 300,
  trickleSpeed: 100
});

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Показываем загрузку при изменении URL
    const handleStart = () => {
      setIsLoading(true);
      NProgress.start();
    };

    const handleComplete = () => {
      setIsLoading(false);
      NProgress.done();
    };

    // Слушаем клики по ссылкам
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.target && !link.download) {
        const url = new URL(link.href);
        // Если это внутренняя ссылка и не та же страница
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          handleStart();
        }
      }
    };

    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [pathname]);

  // Завершаем загрузку когда URL изменился
  useEffect(() => {
    NProgress.done();
    setIsLoading(false);
  }, [pathname, searchParams]);

  return (
    <>
      {/* NProgress CSS */}
      <style jsx global>{`
        #nprogress {
          pointer-events: none;
        }
        #nprogress .bar {
          background: linear-gradient(90deg, #a855f7, #ec4899, #3b82f6);
          position: fixed;
          z-index: 9999;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          box-shadow: 0 0 10px #a855f7, 0 0 5px #ec4899;
        }
        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          box-shadow: 0 0 10px #a855f7, 0 0 5px #a855f7;
          opacity: 1;
          transform: rotate(3deg) translate(0px, -4px);
        }
      `}</style>

      {/* Full screen loader overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[98] pointer-events-none flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex flex-col items-center gap-4">
            {/* Animated brain */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
                🧠
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
