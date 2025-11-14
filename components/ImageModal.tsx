"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ImageModalProps {
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

export default function ImageModal({ imageUrl, alt, onClose }: ImageModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Image */}
      <div
        className="max-w-7xl max-h-[90vh] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-2xl shadow-2xl"
        />
      </div>

      {/* Hint text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-sm">
        Нажмите ESC или кликните вне картинки чтобы закрыть
      </div>
    </div>
  );
}
