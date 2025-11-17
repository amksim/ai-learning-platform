"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, X, CheckCircle2 } from "lucide-react";
import VideoModal from "./VideoModal";

export interface LessonVideoData {
  url: string;
  title: string;
  size: "small" | "medium" | "large" | "full";
  position: "left" | "center" | "right";
  caption?: string;
  poster?: string; // Превью видео
  translations?: Record<string, string>; // Переводы ЭТОГО видео: { en: "url", uk: "url", ... }
}

interface LessonVideoProps {
  video: LessonVideoData;
  language?: string; // Текущий язык пользователя
  videoIndex?: number; // Индекс видео в уроке
  lessonId?: number; // ID урока для сохранения прогресса
}

const sizeClasses = {
  small: "max-w-xs",
  medium: "max-w-md",
  large: "max-w-2xl",
  full: "w-full",
};

const positionClasses = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
};

// Helper function to convert YouTube URL to embed URL
const getEmbedUrl = (url: string): { embedUrl: string; isExternal: boolean } => {
  // YouTube regular video
  if (url.includes('youtube.com/watch')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return { embedUrl: `https://www.youtube.com/embed/${videoId}`, isExternal: true };
  }
  
  // YouTube Shorts
  if (url.includes('youtube.com/shorts/') || url.includes('youtu.be/shorts/')) {
    const videoId = url.split('/shorts/')[1]?.split('?')[0];
    return { embedUrl: `https://www.youtube.com/embed/${videoId}`, isExternal: true };
  }
  
  // YouTube short URL (youtu.be)
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return { embedUrl: `https://www.youtube.com/embed/${videoId}`, isExternal: true };
  }
  
  // Vimeo
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return { embedUrl: `https://player.vimeo.com/video/${videoId}`, isExternal: true };
  }
  
  // Direct video file or base64
  return { embedUrl: url, isExternal: false };
};

export default function LessonVideo({ video, language = 'ru', videoIndex = 0, lessonId }: LessonVideoProps) {
  // Проверяем есть ли переведенное видео для текущего языка в самом видео
  const translatedVideoUrl = video.translations?.[language];
  
  // ЛОГИКА:
  // - Если русский язык -> показываем оригинал (video.url)
  // - Если другой язык И есть перевод -> показываем перевод
  // - Если другой язык И НЕТ перевода -> НЕ показываем видео (null)
  const videoUrl = language === 'ru' 
    ? video.url 
    : translatedVideoUrl;
  
  const [showModal, setShowModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const watchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Загружаем статус просмотра из localStorage
  useEffect(() => {
    if (lessonId) {
      const watchedKey = `video-watched-${lessonId}-${videoIndex}`;
      const watched = localStorage.getItem(watchedKey) === 'true';
      setIsWatched(watched);
    }
  }, [lessonId, videoIndex]);
  
  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (watchTimerRef.current) {
        clearTimeout(watchTimerRef.current);
      }
    };
  }, []);
  
  // Отмечаем видео как просмотренное ТОЛЬКО после 3 секунд просмотра
  const markAsWatched = () => {
    if (lessonId && !isWatched) {
      const watchedKey = `video-watched-${lessonId}-${videoIndex}`;
      localStorage.setItem(watchedKey, 'true');
      setIsWatched(true);
      console.log('✅ Видео отмечено как просмотренное!');
    }
  };
  
  // Для YouTube/Vimeo - запускаем таймер на 5 секунд после загрузки iframe
  // (предполагаем что если пользователь не ушел за 5 сек, он смотрит)
  const handleIframeReady = () => {
    if (!isWatched && lessonId) {
      console.log('⏱️ Запускаем 5-секундный таймер для YouTube/Vimeo...');
      watchTimerRef.current = setTimeout(() => {
        console.log('✅ 5 секунд прошло, отмечаем как просмотренное');
        markAsWatched();
      }, 5000); // 5 секунд - более честно для YouTube
    }
  };
  
  // Для прямого видео - отслеживаем время просмотра
  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!isWatched && video.currentTime >= 3) {
      console.log('✅ Пользователь посмотрел 3+ секунд');
      markAsWatched();
    }
  };

  // Функция для fullscreen
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).mozRequestFullScreen) {
        (videoRef.current as any).mozRequestFullScreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        (videoRef.current as any).msRequestFullscreen();
      }
    }
  };
  
  // Если нет видео для текущего языка - показываем заглушку
  if (!videoUrl) {
    return (
      <div className="w-full">
        <div 
          className="relative group overflow-hidden rounded-lg border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 p-8"
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="text-center">
            <div className="mb-4">
              <span className="text-6xl">🎬</span>
            </div>
            <h4 className="text-xl font-bold mb-2 text-yellow-400">{video.title}</h4>
            <p className="text-gray-400 mb-4">
              Видео на <strong className="text-yellow-400 uppercase">{language}</strong> языке пока не добавлено
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <span className="text-sm text-yellow-300">
                💡 Переключитесь на русский язык чтобы посмотреть оригинал
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const { embedUrl, isExternal } = getEmbedUrl(videoUrl);
  
  // Debug logging
  console.log('🎬 Video Debug:', {
    originalUrl: video.url,
    translatedUrl: translatedVideoUrl,
    currentLanguage: language,
    embedUrl,
    isExternal,
    title: video.title,
    allTranslations: video.translations
  });

  return (
    <>
      <div className="w-full">
        <div 
          className="relative group overflow-hidden rounded-lg border-2 border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Большая галочка для просмотренных видео */}
          {isWatched && (
            <div className="absolute top-4 left-4 z-20 bg-green-500 rounded-full p-2 shadow-lg">
              <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={3} />
            </div>
          )}
          
          {/* Индикатор языка видео */}
          {translatedVideoUrl && (
            <div className="absolute top-4 right-4 z-20 bg-blue-500/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
              <p className="text-white text-xs font-bold uppercase flex items-center gap-1">
                <span>🌍</span> {language}
              </p>
            </div>
          )}
          
          {/* Video Player */}
          <div className="relative aspect-video">
            {isExternal ? (
              // YouTube/Vimeo iframe - запускаем таймер на 3 секунды
              <iframe
                key={embedUrl}
                src={embedUrl}
                className="w-full h-full rounded-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title}
                onLoad={handleIframeReady}
              />
            ) : (
              // Direct video file - отслеживаем время просмотра
              <video
                ref={videoRef}
                key={embedUrl}
                className="w-full h-full object-cover rounded-2xl"
                poster={video.poster}
                preload="metadata"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleVideoTimeUpdate}
                onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
              >
                <source src={embedUrl} type="video/mp4" />
                <source src={embedUrl} type="video/webm" />
                Ваш браузер не поддерживает видео.
              </video>
            )}

            {/* Fullscreen button only for direct videos */}
            {!isExternal && (
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFullscreen();
                  }}
                  className="p-2 bg-black/70 hover:bg-black/90 rounded-full transition-colors backdrop-blur-sm"
                  title="Полный экран"
                >
                  <Maximize2 className="h-5 w-5 text-white" />
                </button>
              </div>
            )}

            {/* Video Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
              <h5 className="text-white font-semibold text-sm">{video.title}</h5>
              {video.caption && (
                <p className="text-white/80 text-xs mt-1">{video.caption}</p>
              )}
              {!isExternal && embedUrl && (
                <p className="text-red-400 text-xs mt-1">⚠️ Не YouTube: {embedUrl.substring(0, 50)}...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <VideoModal
          videoUrl={videoUrl}
          videoTitle={video.title}
          poster={video.poster}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
