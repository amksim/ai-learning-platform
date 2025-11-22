'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Clock, FileText, Target, Save } from 'lucide-react';

interface CourseStats {
  id: number;
  slug: string;
  title: string;
  icon: string;
  video_minutes: number;
  text_pages: number;
  practice_tasks: number;
}

export default function CourseStatsEditorNew() {
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/course-categories', {
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.categories) {
        setCourses(data.categories);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (courseId: number, field: keyof CourseStats, value: number) => {
    console.log('🔄 Начинаю обновление:', { courseId, field, value });
    
    try {
      // Сохраняем старое значение на случай отката
      const course = courses.find(c => c.id === courseId);
      const oldValue = course ? course[field] : undefined;
      
      // Обновляем локально (оптимистично)
      setCourses(courses.map(c => 
        c.id === courseId ? { ...c, [field]: value } : c
      ));

      // Сохраняем в БД
      const response = await fetch('/api/course-categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: courseId, [field]: value })
      });

      console.log('📡 API Response status:', response.status);
      
      const result = await response.json();
      console.log('📡 API Response data:', result);

      if (!response.ok) {
        console.error('❌ API Error:', result);
        // При ошибке - откатываем
        setCourses(courses.map(c => 
          c.id === courseId ? { ...c, [field]: oldValue } : c
        ));
        alert(`❌ Ошибка: ${result.error || 'Неизвестная ошибка'}`);
        return;
      }

      console.log('✅ Успешно сохранено:', result);
      
      // БЕЗ перезагрузки - доверяем успешному ответу API
      
    } catch (error) {
      console.error('❌ Ошибка сети:', error);
      loadCourses();
      alert('❌ Ошибка сети при сохранении');
    }
  };

  if (loading) {
    return (
      <Card className="glass border border-purple-500/30">
        <CardContent className="p-4">
          <p className="text-sm text-gray-400">⏳ Загрузка...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border border-purple-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-purple-400 flex items-center gap-2">
          📊 Статистика курсов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {courses.map((course) => (
          <div 
            key={course.id}
            className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50"
          >
            {/* Заголовок */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{course.icon}</span>
              <h3 className="text-sm font-bold text-white">{course.title}</h3>
            </div>

            {/* Компактная сетка полей */}
            <div className="grid grid-cols-3 gap-2">
              {/* Видео */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-[10px] text-blue-400 font-semibold">
                  <Clock className="h-3 w-3" />
                  Видео (мин)
                </label>
                <input
                  type="number"
                  min="0"
                  value={course.video_minutes}
                  onChange={(e) => updateStats(course.id, 'video_minutes', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded px-2 py-1.5 text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Текст */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-[10px] text-green-400 font-semibold">
                  <FileText className="h-3 w-3" />
                  Текст (листы)
                </label>
                <input
                  type="number"
                  min="0"
                  value={course.text_pages}
                  onChange={(e) => updateStats(course.id, 'text_pages', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded px-2 py-1.5 text-white text-sm focus:border-green-500 focus:outline-none"
                />
              </div>

              {/* Практика */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-[10px] text-orange-400 font-semibold">
                  <Target className="h-3 w-3" />
                  Практика
                </label>
                <input
                  type="number"
                  min="0"
                  value={course.practice_tasks}
                  onChange={(e) => updateStats(course.id, 'practice_tasks', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded px-2 py-1.5 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
