"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { Trophy, Target, Clock, BookOpen, CheckCircle } from "lucide-react";

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

interface Lesson {
  id: number;
  course_category_id: number | null;
}

interface CourseStatsWidgetProps {
  completedLessonIds: number[];
}

const colorMap: Record<string, { bg: string; text: string; border: string; progress: string }> = {
  blue: {
    bg: 'from-blue-500 via-cyan-500 to-teal-500',
    text: 'text-blue-400',
    border: 'border-blue-400/40',
    progress: 'bg-gradient-to-r from-blue-500 to-cyan-500'
  },
  purple: {
    bg: 'from-purple-500 via-pink-500 to-rose-500',
    text: 'text-purple-400',
    border: 'border-purple-400/40',
    progress: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  orange: {
    bg: 'from-orange-500 via-red-500 to-pink-500',
    text: 'text-orange-400',
    border: 'border-orange-400/40',
    progress: 'bg-gradient-to-r from-orange-500 to-red-500'
  },
  green: {
    bg: 'from-green-500 via-emerald-500 to-teal-500',
    text: 'text-green-400',
    border: 'border-green-400/40',
    progress: 'bg-gradient-to-r from-green-500 to-emerald-500'
  },
};

export default function CourseStatsWidget({ completedLessonIds }: CourseStatsWidgetProps) {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Загружаем категории курсов
        const categoriesResponse = await fetch('/api/course-categories');
        const categoriesData = await categoriesResponse.json();
        
        // Загружаем все уроки
        const lessonsResponse = await fetch('/api/courses');
        const lessonsData = await lessonsResponse.json();
        
        if (categoriesData.categories) {
          setCategories(categoriesData.categories);
        }
        
        if (lessonsData.courses) {
          setLessons(lessonsData.courses.map((c: any) => ({
            id: c.id,
            course_category_id: c.course_category_id
          })));
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getCourseStats = (categoryId: number) => {
    // Фильтруем уроки этого курса
    const courseLessons = lessons.filter(l => l.course_category_id === categoryId);
    const totalLessons = courseLessons.length;
    
    // Считаем сколько пройдено
    const completedLessons = courseLessons.filter(l => completedLessonIds.includes(l.id)).length;
    
    // Процент прогресса
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    return { totalLessons, completedLessons, progress };
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}м`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
  };

  // Общая статистика
  const totalStats = {
    totalLessons: lessons.length,
    completedLessons: completedLessonIds.length,
    progress: lessons.length > 0 ? Math.round((completedLessonIds.length / lessons.length) * 100) : 0,
    totalPages: categories.reduce((sum, cat) => sum + cat.total_pages, 0),
    totalVideoMinutes: categories.reduce((sum, cat) => sum + cat.total_video_minutes, 0),
    totalTasks: categories.reduce((sum, cat) => sum + cat.total_tasks, 0)
  };

  if (loading) {
    return (
      <Card className="glass border-2 border-purple-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Статистика по курсам
            </span>
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
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-400" />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Статистика по курсам
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Общая статистика */}
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 border-2 border-purple-400/30">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Общий прогресс</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {/* Уроки */}
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {totalStats.completedLessons}/{totalStats.totalLessons}
              </div>
              <div className="text-xs text-gray-400">Уроки</div>
            </div>
            
            {/* Страницы */}
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {totalStats.totalPages}
              </div>
              <div className="text-xs text-gray-400">Страниц</div>
            </div>
            
            {/* Видео */}
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {formatTime(totalStats.totalVideoMinutes)}
              </div>
              <div className="text-xs text-gray-400">Видео</div>
            </div>
            
            {/* Задания */}
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {totalStats.totalTasks}
              </div>
              <div className="text-xs text-gray-400">Заданий</div>
            </div>
          </div>
          
          {/* Прогресс-бар */}
          <div className="relative h-3 bg-gray-700/50 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-500"
              style={{ width: `${totalStats.progress}%` }}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-sm font-semibold text-purple-400">{totalStats.progress}%</span>
            <span className="text-xs text-gray-400 ml-2">общий прогресс</span>
          </div>
        </div>

        {/* Статистика по курсам */}
        <div className="space-y-4">
          {categories.map((category) => {
            const stats = getCourseStats(category.id);
            const colors = colorMap[category.color] || colorMap.blue;

            return (
              <div
                key={category.id}
                className={`p-4 rounded-lg glass border-2 ${colors.border} hover:border-opacity-60 transition-all`}
              >
                {/* Заголовок курса */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colors.bg} flex items-center justify-center text-xl`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className={`font-bold bg-gradient-to-r ${colors.bg} bg-clip-text text-transparent`}>
                        {category.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {stats.completedLessons}/{stats.totalLessons} уроков
                      </p>
                    </div>
                  </div>
                  
                  {/* Процент */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${colors.text}`}>
                      {stats.progress}%
                    </div>
                    {stats.progress === 100 && (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Пройдено
                      </div>
                    )}
                  </div>
                </div>

                {/* Прогресс-бар */}
                <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`absolute inset-y-0 left-0 ${colors.progress} transition-all duration-500`}
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>

                {/* Детали */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {/* Текст */}
                  {category.total_pages > 0 && (
                    <div className="flex items-center gap-1 text-gray-400">
                      <BookOpen className="h-3 w-3" />
                      <span>{category.total_pages} стр</span>
                    </div>
                  )}
                  
                  {/* Видео */}
                  {category.total_video_minutes > 0 && (
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(category.total_video_minutes)}</span>
                    </div>
                  )}
                  
                  {/* Задания */}
                  {category.total_tasks > 0 && (
                    <div className="flex items-center gap-1 text-gray-400">
                      <Target className="h-3 w-3" />
                      <span>{category.total_tasks} задач</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Если нет курсов */}
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Статистика по курсам появится после настройки</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
