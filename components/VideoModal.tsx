"use client";

import { useState, useEffect, useRef } from "react";
import { X, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";

interface VideoModalProps {
  videoUrl: string;
  videoTitle: string;
  poster?: string;
  onClose: () => void;
}

// Helper function to convert YouTube URL to embed URL
const getEmbedUrl = (url: string): { embedUrl: string; isExternal: boolean } => {
  // YouTube regular video
  if (url.includes('youtube.com/watch')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return { embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`, isExternal: true };
  }
  
  // YouTube Shorts
  if (url.includes('youtube.com/shorts/') || url.includes('youtu.be/shorts/')) {
    const videoId = url.split('/shorts/')[1]?.split('?')[0];
    return { embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`, isExternal: true };
  }
  
  // YouTube short URL (youtu.be)
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return { embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`, isExternal: true };
  }
  
  // Vimeo
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return { embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`, isExternal: true };
  }
  
  // Direct video file or base64
  return { embedUrl: url, isExternal: false };
};

export default function VideoModal({ videoUrl, videoTitle, poster, onClose }: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const { embedUrl, isExternal } = getEmbedUrl(videoUrl);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Hide controls after 3 seconds
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setTimeout(() => {
      setIsControlsVisible(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isPlaying]);

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full h-full max-w-7xl max-h-[90vh] p-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">{videoTitle}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Video Container */}
        <div className="flex-1 relative bg-black rounded-2xl overflow-hidden shadow-2xl">
          {isExternal ? (
            // YouTube/Vimeo iframe (fullscreen mode)
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={videoTitle}
            />
          ) : (
            // Direct video file
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              poster={poster}
              controls
              autoPlay
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
              onDoubleClick={toggleFullscreen}
            >
              <source src={embedUrl} type="video/mp4" />
              <source src={embedUrl} type="video/webm" />
              Ваш браузер не поддерживает видео.
            </video>
          )}
        </div>

        {/* Hint text */}
        <div className="mt-4 text-center text-white/70 text-sm">
          Нажмите ESC или кликните вне видео чтобы закрыть
          {!isExternal && " • Двойной клик для полноэкранного режима"}
        </div>
      </div>
    </div>
  );
}
