"use client";

import { useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, X } from "lucide-react";
import VideoModal from "./VideoModal";

export interface LessonVideoData {
  url: string;
  title: string;
  size: "small" | "medium" | "large" | "full";
  position: "left" | "center" | "right";
  caption?: string;
  poster?: string; // Превью видео
}

interface LessonVideoProps {
  video: LessonVideoData;
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

export default function LessonVideo({ video }: LessonVideoProps) {
  const [showModal, setShowModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const { embedUrl, isExternal } = getEmbedUrl(video.url);
  
  // Debug logging
  console.log('🎬 Video Debug:', {
    originalUrl: video.url,
    embedUrl,
    isExternal,
    title: video.title
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
          {/* Video Player */}
          <div className="relative aspect-video">
            {isExternal ? (
              // YouTube/Vimeo iframe
              <iframe
                src={embedUrl}
                className="w-full h-full rounded-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            ) : (
              // Direct video file
              <video
                className="w-full h-full object-cover rounded-2xl"
                poster={video.poster}
                preload="metadata"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
              >
                <source src={embedUrl} type="video/mp4" />
                <source src={embedUrl} type="video/webm" />
                Ваш браузер не поддерживает видео.
              </video>
            )}

            {/* Fullscreen button for external videos */}
            {isExternal && (
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                  className="p-2 bg-black/70 hover:bg-black/90 rounded-full transition-colors backdrop-blur-sm"
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
          videoUrl={video.url}
          videoTitle={video.title}
          poster={video.poster}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
