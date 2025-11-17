"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { LessonImageData } from "./LessonImage";

interface ImageModalProps {
  images: LessonImageData[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageModal({ images, initialIndex, onClose }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onClose, images.length]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Previous button */}
      {hasMultipleImages && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrevious();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>
      )}

      {/* Next button */}
      {hasMultipleImages && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>
      )}

      {/* Image */}
      <div
        className="max-w-7xl max-h-[90vh] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.url}
          alt={currentImage.alt}
          className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
        />
        
        {/* Caption */}
        {currentImage.caption && (
          <p className="mt-4 text-center text-white/90 text-lg">
            {currentImage.caption}
          </p>
        )}
      </div>

      {/* Image counter & hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        {hasMultipleImages && (
          <div className="text-white font-medium mb-2">
            {currentIndex + 1} / {images.length}
          </div>
        )}
        <div className="text-white/70 text-sm">
          {hasMultipleImages 
            ? "← → стрелки для навигации • ESC для закрытия"
            : "ESC или клик вне картинки чтобы закрыть"
          }
        </div>
      </div>
    </div>
  );
}
