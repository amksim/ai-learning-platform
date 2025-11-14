"use client";

import { useState, useEffect, useRef } from "react";
import { X, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";

interface VideoModalProps {
  videoUrl: string;
  videoTitle: string;
  poster?: string;
  onClose: () => void;
}

export default function VideoModal({ videoUrl, videoTitle, poster, onClose }: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
        <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            poster={poster}
            controls
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
            onDoubleClick={toggleFullscreen}
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            Ваш браузер не поддерживает видео.
          </video>

          {/* Custom controls overlay */}
          {isControlsVisible && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="text-white text-sm">
                {videoTitle}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4 text-white" />
                  ) : (
                    <Maximize2 className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hint text */}
        <div className="mt-4 text-center text-white/70 text-sm">
          Нажмите ESC или кликните вне видео чтобы закрыть • Двойной клик для полноэкранного режима
        </div>
      </div>
    </div>
  );
}
