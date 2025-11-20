"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Save, Edit, X, BookOpen, Clock, Target } from "lucide-react";
import toast from "react-hot-toast";

interface CourseCategory {
  id: number;
  slug: string;
  title: string;
  icon: string;
  color: string;
  total_lessons: number;
  total_pages: number;
  total_video_minutes: number;
  total_tasks: number;
}

export default function CourseStatsManager() {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<CourseCategory>>({});
  const [loading, setLoading] = useState(true);

  // Загрузка категорий
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/course-categories');
      const data = await response.json();
      
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      toast.error('Не удалось загрузить категории');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEdit = (category: CourseCategory) => {
    setEditingId(category.id);
    setEditForm({
      total_pages: category.total_pages,
      total_video_minutes: category.total_video_minutes,
      total_tasks: category.total_tasks
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: number) => {
    try {
      const response = await fetch('/api/course-categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm })
      });

      if (!response.ok) throw new Error('Ошибка обновления');

      toast.success('✅ Статистика обновлена!');
      setEditingId(null);
      setEditForm({});
      loadCategories();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Не удалось сохранить');
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}м`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
  };

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    green: 'from-green-500 to-emerald-500'
  };

  if (loading) {
    return (
      <Card className="glass border-2 border-purple-400/20">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            📊 Статистика курсов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-700/50 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-2 border-purple-400/20">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          📊 Статистика курсов
        </CardTitle>
        <p className="text-sm text-gray-400 mt-2">
          Управляй количеством страниц текста, минутами видео и заданиями для каждого курса
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => {
            const isEditing = editingId === category.id;
            const gradient = colorMap[category.color] || colorMap.blue;

            return (
              <div
                key={category.id}
                className="p-4 rounded-lg glass border-2 border-white/10 hover:border-white/20 transition-all"
              >
                {/* Заголовок курса */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center text-2xl`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-400">{category.total_lessons} уроков</p>
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Статистика */}
                {!isEditing ? (
                  <div className="grid grid-cols-3 gap-4">
                    {/* Страницы текста */}
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-blue-400" />
                        <span className="text-xs text-gray-400">Текст</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {category.total_pages} <span className="text-sm text-gray-400">стр</span>
                      </p>
                    </div>

                    {/* Время видео */}
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-purple-400" />
                        <span className="text-xs text-gray-400">Видео</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {formatTime(category.total_video_minutes)}
                      </p>
                    </div>

                    {/* Задания */}
                    <div className="p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-gray-400">Задания</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {category.total_tasks}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Форма редактирования */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Страницы */}
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Страниц текста</label>
                        <input
                          type="number"
                          value={editForm.total_pages || 0}
                          onChange={(e) => setEditForm({ ...editForm, total_pages: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                        />
                      </div>

                      {/* Минуты видео */}
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Минут видео</label>
                        <input
                          type="number"
                          value={editForm.total_video_minutes || 0}
                          onChange={(e) => setEditForm({ ...editForm, total_video_minutes: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                        />
                      </div>

                      {/* Задания */}
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Заданий</label>
                        <input
                          type="number"
                          value={editForm.total_tasks || 0}
                          onChange={(e) => setEditForm({ ...editForm, total_tasks: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Кнопки */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(category.id)}
                        className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Сохранить
                      </button>
                      <button
                        onClick={handleCancel}
                        className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
