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
  translations?: Record<string, string>; // Переводы ЭТОГО изображения: { en: "url", uk: "url", ... }
}

interface LessonImageProps {
  image: LessonImageData;
  allImages?: LessonImageData[];
  currentIndex?: number;
  language?: string; // Текущий язык пользователя
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

export default function LessonImage({ image, allImages, currentIndex = 0, language = 'ru' }: LessonImageProps) {
  const [showModal, setShowModal] = useState(false);
  
  // Функция для получения URL изображения с учетом языка
  const getImageUrl = (img: LessonImageData) => {
    const translatedUrl = img.translations?.[language];
    const imageUrl = language === 'ru' 
      ? img.url 
      : (translatedUrl || img.url); // Если нет перевода, используем русский URL
    return imageUrl;
  };
  
  // Если передан массив - используем его, иначе показываем одну картинку
  const imagesToShow = allImages || [image];
  const indexToShow = allImages ? currentIndex : 0;
  const totalImages = imagesToShow.length;

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
          {/* Image number badge - always visible */}
          {totalImages > 1 && (
            <div className="absolute top-3 left-3 z-10 bg-purple-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-white font-bold text-sm shadow-lg">
              {currentIndex + 1} / {totalImages}
            </div>
          )}

          {/* Image - сохраняем оригинальное качество и пропорции */}
          <img
            src={getImageUrl(image)}
            alt={image.alt}
            className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105 rounded-2xl"
            style={{
              imageRendering: 'auto',
            }}
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
          images={imagesToShow}
          initialIndex={indexToShow}
          onClose={() => setShowModal(false)}
          language={language}
        />
      )}
    </>
  );
}
