"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LessonImageData } from "@/components/LessonImage";
import { supabase } from "@/lib/supabase";

interface ImageUploaderProps {
  images: LessonImageData[];
  onChange: (images: LessonImageData[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newImage, setNewImage] = useState<Partial<LessonImageData>>({
    size: "medium",
    position: "center",
    translations: {}
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем размер файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("⚠️ Файл слишком большой! Максимум 10MB");
      return;
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert("Пожалуйста, выберите файл изображения");
      return;
    }

    setUploading(true);

    try {
      // Создаем уникальное имя файла
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // Загружаем в Supabase Storage
      const { data, error } = await supabase.storage
        .from('course-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        alert('Ошибка загрузки: ' + error.message);
        return;
      }

      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(fileName);

      console.log('✅ Image uploaded:', publicUrl);

      // Сохраняем URL в форму
      setNewImage({
        ...newImage,
        url: publicUrl,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Не удалось загрузить изображение');
    } finally {
      setUploading(false);
    }
  };

  const handleLanguageImageUpload = async (langCode: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Создаем уникальное имя файла с языком
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${langCode}.${fileExt}`;

      // Загружаем в Supabase Storage
      const { data, error } = await supabase.storage
        .from('course-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        alert('Ошибка загрузки: ' + error.message);
        return;
      }

      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(fileName);

      console.log(`✅ Image uploaded for ${langCode}:`, publicUrl);

      // Сохраняем URL в переводы
      const newTranslations = {
        ...newImage.translations,
        [langCode]: publicUrl
      };
      setNewImage({ ...newImage, translations: newTranslations });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Не удалось загрузить изображение');
    } finally {
      setUploading(false);
    }
  };

  const handleAddImage = () => {
    if (!newImage.url || !newImage.alt) {
      alert("Добавьте картинку и описание!");
      return;
    }

    const newImageData = {
      url: newImage.url,
      alt: newImage.alt,
      size: newImage.size || "medium",
      position: newImage.position || "center",
      caption: newImage.caption,
    } as LessonImageData;

    const updatedImages = [...images, newImageData];
    
    console.log('✅ Adding image to form:', newImageData);
    console.log('📸 Total images now:', updatedImages.length);
    
    onChange(updatedImages);

    // Reset
    setNewImage({
      size: "medium",
      position: "center",
    });
    setIsAdding(false);
  };

  const handleRemoveImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Картинки урока
        </h3>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить картинку
          </Button>
        )}
      </div>

      {/* Existing images */}
      <div className="space-y-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            {/* Preview */}
            <img
              src={image.url}
              alt={image.alt}
              className="w-20 h-20 object-cover rounded"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{image.alt}</p>
              <p className="text-sm text-gray-400">
                Размер: {image.size} | Позиция: {image.position}
              </p>
              {image.caption && (
                <p className="text-xs text-gray-500 italic">{image.caption}</p>
              )}
              {/* Show translations */}
              {image.translations && Object.keys(image.translations).length > 0 && (
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  {Object.entries(image.translations).map(([lang, url]) => {
                    if (!url) return null;
                    const flags: Record<string, string> = {
                      ru: '🇷🇺', en: '🇬🇧', uk: '🇺🇦', de: '🇩🇪',
                      pl: '🇵🇱', nl: '🇳🇱', ro: '🇷🇴', hu: '🇭🇺'
                    };
                    return (
                      <p key={lang}>
                        {flags[lang] || '🌍'} {lang.toUpperCase()}: {url.substring(0, 30)}...
                      </p>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Remove button */}
            <button
              onClick={() => handleRemoveImage(index)}
              className="p-2 hover:bg-red-500/20 rounded transition-colors"
            >
              <X className="h-4 w-4 text-red-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new image form */}
      {isAdding && (
        <div className="p-4 bg-gray-800/50 rounded-lg border border-purple-500/30 space-y-4">
          <h4 className="font-semibold">Новая картинка</h4>

          {/* Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Загрузить картинку
            </label>
            <div className="flex items-center gap-3">
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg transition-colors ${
                uploading 
                  ? 'border-purple-500 bg-purple-500/10 cursor-wait' 
                  : 'border-gray-600 cursor-pointer hover:border-purple-500'
              }`}>
                <Upload className="h-5 w-5" />
                <span>{uploading ? 'Загрузка...' : 'Выбрать файл'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {newImage.url && !uploading && (
                <img
                  src={newImage.url}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded"
                />
              )}
            </div>
          </div>

          {/* Alt text */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Описание (ALT текст)
            </label>
            <input
              type="text"
              value={newImage.alt || ""}
              onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })}
              placeholder="Скриншот интерфейса"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Caption (optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Подпись (необязательно)
            </label>
            <input
              type="text"
              value={newImage.caption || ""}
              onChange={(e) =>
                setNewImage({ ...newImage, caption: e.target.value })
              }
              placeholder="Рисунок 1. Главная страница"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Multilingual URLs */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Изображения на других языках (необязательно)
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { code: 'ru', name: '🇷🇺 Русский' },
                { code: 'en', name: '🇬🇧 Английский' },
                { code: 'uk', name: '🇺🇦 Украинский' },
                { code: 'de', name: '🇩🇪 Германский' },
                { code: 'pl', name: '🇵🇱 Польский' },
                { code: 'nl', name: '🇳🇱 Нидерланды' },
                { code: 'ro', name: '🇷🇴 Румыния/Молдова' },
                { code: 'hu', name: '🇭🇺 Венгрия' },
              ].map((lang) => (
                <div key={lang.code} className="space-y-1">
                  <label className="block text-xs font-medium text-gray-300">
                    {lang.name}
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={newImage.translations?.[lang.code] || ''}
                    onChange={(e) => {
                      const newTranslations = {
                        ...newImage.translations,
                        [lang.code]: e.target.value
                      };
                      setNewImage({ ...newImage, translations: newTranslations });
                    }}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-xs"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300">
                💡 <strong>Совет:</strong> Создайте версии изображения с текстом на разных языках и загрузите их. Пользователи увидят изображение на своем языке!
              </p>
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Размер</label>
            <select
              value={newImage.size}
              onChange={(e) =>
                setNewImage({
                  ...newImage,
                  size: e.target.value as LessonImageData["size"],
                })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-purple-500 focus:outline-none"
            >
              <option value="small">Маленький (320px)</option>
              <option value="medium">Средний (768px)</option>
              <option value="large">Большой (1024px)</option>
              <option value="full">На всю ширину</option>
            </select>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium mb-2">Позиция</label>
            <select
              value={newImage.position}
              onChange={(e) =>
                setNewImage({
                  ...newImage,
                  position: e.target.value as LessonImageData["position"],
                })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-purple-500 focus:outline-none"
            >
              <option value="left">Слева</option>
              <option value="center">По центру</option>
              <option value="right">Справа</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button onClick={handleAddImage} className="flex-1">
              Добавить
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewImage({ size: "medium", position: "center" });
              }}
              variant="outline"
              className="flex-1"
            >
              Отмена
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
