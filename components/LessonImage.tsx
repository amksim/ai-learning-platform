"use client";

import { useState } from "react";
import { ZoomIn } from "lucide-react";
import ImageModal from "./ImageModal";

export interface LessonImageData {
  url: string;
  alt: string;
  size: "small" | "medium" | "large" | "full";
  position: "left" | "center" | "right";
  caption?: string;
}

interface LessonImageProps {
  image: LessonImageData;
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

export default function LessonImage({ image }: LessonImageProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="w-full">
        <div
          className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
          style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
          onClick={() => setShowModal(true)}
        >
          {/* Image */}
          <img
            src={image.url}
            alt={image.alt}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105 rounded-2xl"
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-purple-600 rounded-full p-3">
              <ZoomIn className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Hint text */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 px-3 py-1 rounded-full text-xs text-white">
            Нажмите чтобы увеличить
          </div>
        </div>

        {/* Caption */}
        {image.caption && (
          <p className="mt-2 text-sm text-gray-400 text-center italic">
            {image.caption}
          </p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ImageModal
          imageUrl={image.url}
          alt={image.alt}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
