"use client";

import { useState } from "react";
import { Upload, X, Video, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LessonVideoData } from "@/components/LessonVideo";

interface VideoUploaderProps {
  videos: LessonVideoData[];
  onChange: (videos: LessonVideoData[]) => void;
}

export default function VideoUploader({ videos, onChange }: VideoUploaderProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newVideo, setNewVideo] = useState<Partial<LessonVideoData>>({
    size: "medium",
    position: "center",
  });

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем размер файла (максимум 50MB - base64 увеличивает размер на 33%)
    const maxSize = 50 * 1024 * 1024; // 50MB для base64
    if (file.size > maxSize) {
      alert("⚠️ Файл слишком большой для прямой загрузки!\n\nДля больших видео (>50MB):\n1. Загрузи видео на YouTube (unlisted)\n2. Или используй Vimeo\n3. Вставь URL ниже\n\nМаксимум для прямой загрузки: 50MB");
      return;
    }

    // Проверяем тип файла
    if (!file.type.startsWith('video/')) {
      alert("Пожалуйста, выберите видеофайл");
      return;
    }

    // ВАЖНО: Предупреждаем о длительной загрузке
    alert("⏳ Загрузка может занять некоторое время...\n\nПожалуйста, подожди пока видео загрузится.");

    // Конвертируем в base64 (как с картинками)
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNewVideo({
        ...newVideo,
        url: base64,
      });
      alert("✅ Видео загружено! Теперь можешь добавить описание и сохранить.");
    };
    reader.onerror = () => {
      alert("❌ Ошибка загрузки видео. Попробуй файл поменьше или используй YouTube URL.");
    };
    reader.readAsDataURL(file);
  };

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const posterUrl = event.target?.result as string;
      setNewVideo({
        ...newVideo,
        poster: posterUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddVideo = () => {
    if (!newVideo.url || !newVideo.title) {
      alert("Добавьте видео и название!");
      return;
    }

    // Очищаем пустые переводы
    const cleanedTranslations = newVideo.translations 
      ? Object.fromEntries(
          Object.entries(newVideo.translations).filter(([_, url]) => url && url.trim() !== '')
        )
      : undefined;

    onChange([
      ...videos,
      {
        url: newVideo.url,
        title: newVideo.title,
        size: newVideo.size || "medium",
        position: newVideo.position || "center",
        caption: newVideo.caption,
        poster: newVideo.poster,
        translations: cleanedTranslations,
      } as LessonVideoData,
    ]);

    // Reset
    setNewVideo({
      size: "medium",
      position: "center",
    });
    setIsAdding(false);
  };

  const handleRemoveVideo = (index: number) => {
    onChange(videos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Video className="h-5 w-5" />
          Видео урока
        </h3>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить видео
          </Button>
        )}
      </div>

      {/* Existing videos */}
      <div className="space-y-3">
        {videos.map((video, index) => (
          <div
            key={index}
            className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <div className="flex items-start gap-3 mb-2">
              {/* Preview */}
              <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                <Video className="h-6 w-6 text-gray-400" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{video.title}</p>
                <p className="text-sm text-gray-400">
                  Размер: {video.size} | Позиция: {video.position}
                </p>
                {video.caption && (
                  <p className="text-xs text-gray-500 italic">{video.caption}</p>
                )}
                {video.poster && (
                  <p className="text-xs text-green-400">✓ Превью добавлено</p>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemoveVideo(index)}
                className="p-2 hover:bg-red-500/20 rounded transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4 text-red-400" />
              </button>
            </div>

            {/* Translations info */}
            {video.translations && Object.keys(video.translations).length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-xs text-purple-400 mb-1">
                  🌍 Переводы ({Object.keys(video.translations).length}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(video.translations).map(([lang, url]) => (
                    url && (
                      <span
                        key={lang}
                        className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs"
                      >
                        {lang.toUpperCase()}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new video form */}
      {isAdding && (
        <div className="p-4 bg-gray-800/50 rounded-lg border border-blue-500/30 space-y-4">
          <h4 className="font-semibold">Новое видео</h4>

          {/* Upload video */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Видео (загрузить макс. 50MB или вставить URL)
            </label>
            
            {/* URL Input */}
            <div className="mb-3">
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=... или https://vimeo.com/..."
                value={newVideo.url?.startsWith('data:') ? '' : newVideo.url || ''}
                onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Для больших видео (30+ мин) используй YouTube или Vimeo
              </p>
            </div>
            
            {/* File Upload */}
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <Upload className="h-5 w-5" />
                <span>Или выбрать файл (&lt;50MB)</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>
              {newVideo.url && (
                <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center">
                  <Video className="h-6 w-6 text-green-400" />
                </div>
              )}
            </div>
          </div>

          {/* Upload poster */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Превью видео (необязательно)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <Upload className="h-5 w-5" />
                <span>Выбрать превью</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePosterUpload}
                  className="hidden"
                />
              </label>
              {newVideo.poster && (
                <img
                  src={newVideo.poster}
                  alt="Poster preview"
                  className="w-20 h-20 object-cover rounded"
                />
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Название видео
            </label>
            <input
              type="text"
              value={newVideo.title || ""}
              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
              placeholder="Введение в React"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Caption (optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Подпись (необязательно)
            </label>
            <input
              type="text"
              value={newVideo.caption || ""}
              onChange={(e) =>
                setNewVideo({ ...newVideo, caption: e.target.value })
              }
              placeholder="Видео 1. Основы React"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium mb-2">Размер</label>
            <select
              value={newVideo.size}
              onChange={(e) =>
                setNewVideo({
                  ...newVideo,
                  size: e.target.value as LessonVideoData["size"],
                })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 focus:outline-none"
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
              value={newVideo.position}
              onChange={(e) =>
                setNewVideo({
                  ...newVideo,
                  position: e.target.value as LessonVideoData["position"],
                })
              }
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:border-blue-500 focus:outline-none"
            >
              <option value="left">Слева</option>
              <option value="center">По центру</option>
              <option value="right">Справа</option>
            </select>
          </div>

          {/* Video Translations */}
          <div className="border-2 border-purple-500/30 rounded-lg p-4 bg-purple-500/5">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <span>🌍</span> Переводы ЭТОГО видео (опционально)
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Укажите URL видео на других языках. Если перевод не указан, будет показано оригинальное видео.
            </p>
            
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
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    value={newVideo.translations?.[lang.code] || ''}
                    onChange={(e) => {
                      const newTranslations = {
                        ...newVideo.translations,
                        [lang.code]: e.target.value
                      };
                      setNewVideo({ ...newVideo, translations: newTranslations });
                    }}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none text-xs"
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300">
                💡 <strong>Совет:</strong> Запишите это видео на разных языках, загрузите на YouTube и вставьте ссылки выше. Пользователи увидят видео на своем языке!
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button onClick={handleAddVideo} className="flex-1">
              Добавить
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewVideo({ size: "medium", position: "center" });
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
