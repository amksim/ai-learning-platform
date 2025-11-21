'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Save, Clock, FileText, Target } from 'lucide-react';

interface CourseStats {
  id: number;
  slug: string;
  title: string;
  icon: string;
  video_minutes: number;
  text_pages: number;
  practice_tasks: number;
}

export default function CourseStatsEditor() {
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/course-categories');
      const data = await response.json();
      if (data.categories) {
        setCourses(data.categories);
      }
    } catch (error) {
      console.error('Ошибка загрузки курсов:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCourseStats = async (courseId: number, field: string, value: number) => {
    setSaving(courseId);
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const response = await fetch('/api/course-categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: courseId,
          [field]: value
        })
      });

      if (response.ok) {
        setCourses(courses.map(c => 
          c.id === courseId ? { ...c, [field]: value } : c
        ));
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <Card className="glass border-2 border-purple-400/30">
        <CardHeader>
          <CardTitle className="text-purple-400">⏳ Загрузка...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass border-2 border-purple-400/30">
      <CardHeader>
        <CardTitle className="text-purple-400 flex items-center gap-2">
          📊 Статистика курсов
        </CardTitle>
        <p className="text-sm text-gray-400">
          Укажи количество видео, текста и практических задач для каждого курса
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {courses.map((course) => (
            <div 
              key={course.id}
              className="bg-slate-800/50 rounded-xl p-5 border border-slate-700"
            >
              {/* Заголовок курса */}
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">{course.icon}</span>
                {course.title}
              </h3>

              {/* Поля ввода */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Видео (минуты) */}
                <div>
                  <label className="block text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Видео (минуты)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={course.video_minutes || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setCourses(courses.map(c => 
                        c.id === course.id ? { ...c, video_minutes: value } : c
                      ));
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      updateCourseStats(course.id, 'video_minutes', value);
                    }}
                    className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-lg px-4 py-2.5 text-white font-bold focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.floor((course.video_minutes || 0) / 60)}ч {(course.video_minutes || 0) % 60}м
                  </p>
                </div>

                {/* Текст (листы) */}
                <div>
                  <label className="block text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Текст (листы A4)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={course.text_pages || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setCourses(courses.map(c => 
                        c.id === course.id ? { ...c, text_pages: value } : c
                      ));
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      updateCourseStats(course.id, 'text_pages', value);
                    }}
                    className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-lg px-4 py-2.5 text-white font-bold focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Практика */}
                <div>
                  <label className="block text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Практических задач
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={course.practice_tasks || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setCourses(courses.map(c => 
                        c.id === course.id ? { ...c, practice_tasks: value } : c
                      ));
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      updateCourseStats(course.id, 'practice_tasks', value);
                    }}
                    className="w-full bg-slate-900/50 border-2 border-slate-700 rounded-lg px-4 py-2.5 text-white font-bold focus:border-green-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Индикатор сохранения */}
              {saving === course.id && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                  <Save className="h-4 w-4 animate-pulse" />
                  Сохранено!
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Подсказка */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>💡 Подсказка:</strong> Значения сохраняются автоматически при снятии фокуса с поля.
            Укажи примерное количество для каждого курса.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
