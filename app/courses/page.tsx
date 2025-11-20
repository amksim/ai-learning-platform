"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Check, Star, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/Card";
import CourseSwitcher from "@/components/CourseSwitcher";

interface CourseCategory {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  total_lessons: number;
  total_pages: number;
  total_video_minutes: number;
  total_tasks: number;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  icon: string;
  isFree: boolean;
  course_category_id: number | null;
  displayOrder: number;
  translations?: Record<string, any>;
}

export default function CoursesPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<CourseCategory | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка категорий курсов
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('📚 Загрузка категорий курсов...');
        const response = await fetch('/api/course-categories');
        const data = await response.json();
        
        if (data.categories && data.categories.length > 0) {
          console.log('✅ Загружено категорий:', data.categories.length);
          setCategories(data.categories);
          // Выбираем первую категорию по умолчанию
          setActiveCategory(data.categories[0]);
        } else {
          console.log('⚠️ Категорий не найдено');
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки категорий:', error);
      }
    };

    loadCategories();
  }, []);

  // Загрузка уроков
  useEffect(() => {
    const loadLessons = async () => {
      try {
        console.log('📡 Загрузка уроков...');
        const response = await fetch('/api/courses');
        const data = await response.json();
        
        if (data.courses) {
          console.log('✅ Загружено уроков:', data.courses.length);
          const formattedLessons = data.courses.map((course: any) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            difficulty: course.difficulty,
            category: course.category,
            icon: course.icon,
            isFree: course.is_free || false,
            course_category_id: course.course_category_id,
            displayOrder: course.display_order || course.id,
            translations: course.translations || {}
          }));
          
          setLessons(formattedLessons);
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки уроков:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLessons();
  }, []);

  // Фильтрация уроков по активной категории
  useEffect(() => {
    if (activeCategory) {
      const filtered = lessons.filter(lesson => lesson.course_category_id === activeCategory.id);
      const sorted = filtered.sort((a, b) => a.displayOrder - b.displayOrder);
      console.log(`🔍 Уроков в категории "${activeCategory.title}":`, sorted.length);
      setFilteredLessons(sorted);
    } else {
      setFilteredLessons([]);
    }
  }, [activeCategory, lessons]);

  const isLessonUnlocked = (lesson: Lesson, index: number) => {
    // Если идет загрузка авторизации, открываем первый урок
    if (authLoading) {
      return index === 0;
    }
    
    // Для НЕ залогиненных: только первый урок открыт
    if (!user) {
      return index === 0;
    }
    
    // Для залогиненных БЕЗ подписки: бесплатные уроки по порядку
    if (!user.hasPaid) {
      if (index === 0) return true;
      
      if (lesson.isFree && index > 0) {
        const previousLesson = filteredLessons[index - 1];
        return previousLesson ? user.completedLessons.includes(previousLesson.id) : false;
      }
      
      return false;
    }
    
    // Для залогиненных С подпиской: все уроки по порядку
    if (index === 0) return true;
    
    const previousLesson = filteredLessons[index - 1];
    const isPreviousCompleted = previousLesson ? user.completedLessons.includes(previousLesson.id) : false;
    const isCurrentCompleted = user.completedLessons.includes(lesson.id);
    
    return isPreviousCompleted || isCurrentCompleted;
  };

  const isLessonCompleted = (lessonId: number) => {
    if (!user) return false;
    return user.completedLessons.includes(lessonId);
  };

  return (
    <div className="min-h-screen py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Заголовок */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold md:text-5xl">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Путь разработчика
            </span>
          </h1>
          <p className="text-lg text-gray-300 font-medium mb-2">
            Полный курс от нуля до профи с <span className="font-bold text-purple-400">AI</span>
          </p>
        </div>

        {/* Переключатель курсов */}
        {!isLoading && categories.length > 0 && (
          <CourseSwitcher
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        )}

        {/* Скелетон загрузки */}
        {(isLoading || authLoading) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-600 mb-4" />
                <div className="h-6 w-3/4 rounded bg-gradient-to-r from-gray-700 to-gray-600 mb-3" />
                <div className="h-4 w-full rounded bg-gradient-to-r from-gray-700 to-gray-600" />
              </div>
            ))}
          </div>
        )}

        {/* Список уроков */}
        {!isLoading && !authLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {filteredLessons.map((lesson, index) => {
              const isUnlocked = isLessonUnlocked(lesson, index);
              const isCompleted = isLessonCompleted(lesson.id);
              const translated = lesson.translations?.[language] || { title: lesson.title, description: lesson.description };

              return (
                <Card
                  key={lesson.id}
                  id={`lesson-${lesson.id}`}
                  className={`
                    relative overflow-hidden transition-all duration-300
                    ${isUnlocked ? 'cursor-pointer hover:scale-105 glass border-2 border-white/20 hover:border-purple-400/60 premium-shadow' : 'opacity-60 glass border-2 border-white/10'}
                  `}
                  onClick={() => {
                    if (isUnlocked) {
                      router.push(`/courses/level/${lesson.id}`);
                    } else if (!user) {
                      router.push('/login');
                    } else if (!user.hasPaid) {
                      router.push('/payment');
                    }
                  }}
                >
                  {/* Статус */}
                  <div className="absolute top-4 right-4 z-10">
                    {isCompleted && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/90 text-white text-xs font-bold shadow-lg">
                        <Check className="h-3 w-3" />
                        <span>Пройден</span>
                      </div>
                    )}
                    {!isUnlocked && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-bold shadow-lg">
                        <Lock className="h-3 w-3" />
                        <span>{lesson.isFree ? 'Пройди предыдущий' : 'Требуется подписка'}</span>
                      </div>
                    )}
                    {isUnlocked && !isCompleted && lesson.isFree && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/90 text-white text-xs font-bold shadow-lg">
                        <Star className="h-3 w-3" />
                        <span>Бесплатный</span>
                      </div>
                    )}
                  </div>

                  {/* Контент */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Иконка */}
                      <div className="text-4xl">
                        {lesson.icon || '📚'}
                      </div>

                      {/* Текст */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-purple-400 uppercase">
                            Урок {index + 1}
                          </span>
                          {!isUnlocked && <Lock className="h-3 w-3 text-gray-400" />}
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {translated.title}
                        </h3>
                        
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {translated.description}
                        </p>
                      </div>
                    </div>

                    {/* Кнопка */}
                    <div className="mt-4">
                      {isUnlocked ? (
                        <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all shadow-lg">
                          {isCompleted ? 'Повторить урок' : 'Начать урок'}
                        </button>
                      ) : !user ? (
                        <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-semibold transition-all">
                          Войдите чтобы продолжить
                        </button>
                      ) : (
                        <button className="w-full py-2 px-4 bg-gray-700 text-gray-400 rounded-lg font-semibold cursor-not-allowed">
                          {lesson.isFree ? 'Пройдите предыдущий урок' : 'Требуется подписка'}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Сообщение если нет уроков */}
        {!isLoading && !authLoading && filteredLessons.length === 0 && activeCategory && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">
              Пока нет уроков в этом курсе
            </h3>
            <p className="text-gray-400">
              Уроки скоро появятся!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
