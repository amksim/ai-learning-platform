"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { LessonImageData } from "./LessonImage";

interface ImageModalProps {
  images: LessonImageData[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageModal({ images, initialIndex, onClose }: ImageModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to clicked image on mount
  useEffect(() => {
    if (scrollRef.current) {
      // Небольшая задержка для надёжности рендеринга
      setTimeout(() => {
        const imageElements = scrollRef.current?.querySelectorAll('.gallery-image');
        if (imageElements && imageElements[initialIndex]) {
          imageElements[initialIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [initialIndex]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* Close button - fixed */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Images container - scrollable */}
      <div
        ref={scrollRef}
        className="max-w-4xl mx-auto py-20 px-4 space-y-12"
        onClick={(e) => e.stopPropagation()}
      >
        {images.map((image, index) => (
          <div key={index} className="gallery-image">
            {/* Image */}
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-auto object-contain rounded-2xl shadow-2xl"
            />
            
            {/* Caption */}
            {image.caption && (
              <p className="mt-4 text-center text-white/90 text-lg">
                {image.caption}
              </p>
            )}

            {/* Image number (if multiple images) */}
            {images.length > 1 && (
              <p className="mt-2 text-center text-white/50 text-sm">
                Изображение {index + 1} из {images.length}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Hint text - fixed at bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-sm text-center">
        {images.length > 1 ? (
          <>Скролл вниз для просмотра всех изображений • ESC для закрытия</>
        ) : (
          <>ESC или клик вне картинки чтобы закрыть</>
        )}
      </div>
    </div>
  );
}
