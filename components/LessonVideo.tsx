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

  return (
    <>
      <div
        className={`my-6 ${positionClasses[video.position]} ${sizeClasses[video.size]}`}
      >
        <div className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/20">
          {/* Video Player */}
          <div className="relative aspect-video">
            {isExternal ? (
              // YouTube/Vimeo iframe
              <iframe
                src={embedUrl}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            ) : (
              // Direct video file
              <video
                className="w-full h-full object-cover rounded-lg"
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
              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                  <Maximize2 className="h-4 w-4 text-white" />
                </button>
              </div>
            )}

            {/* Size indicator */}
            <div className="absolute top-2 left-2 bg-blue-600/80 px-2 py-1 rounded text-xs text-white">
              {video.size === 'small' ? '320px' :
               video.size === 'medium' ? '768px' :
               video.size === 'large' ? '1024px' : '100%'}
            </div>
          </div>

          {/* Caption */}
          {video.caption && (
            <p className="mt-2 text-sm text-gray-400 text-center italic">
              {video.caption}
            </p>
          )}
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
