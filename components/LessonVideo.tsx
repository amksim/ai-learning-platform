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

export default function LessonVideo({ video }: LessonVideoProps) {
  const [showModal, setShowModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <>
      <div
        className={`my-6 ${positionClasses[video.position]} ${sizeClasses[video.size]}`}
      >
        <div className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/20">
          {/* Video Player */}
          <div className="relative aspect-video">
            <video
              className="w-full h-full object-cover rounded-lg"
              poster={video.poster}
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
            >
              <source src={video.url} type="video/mp4" />
              <source src={video.url} type="video/webm" />
              Ваш браузер не поддерживает видео.
            </video>

            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Top controls */}
              <div className="absolute top-2 right-2 flex gap-2">
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

              {/* Center play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-blue-600/80 hover:bg-blue-600 rounded-full p-4 transition-colors">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Bottom controls hint */}
              <div className="absolute bottom-2 left-2 text-xs text-white/80">
                Нажмите чтобы воспроизвести
              </div>
            </div>

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
