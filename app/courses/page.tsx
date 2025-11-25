"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Check, Star, TrendingUp, Code, Sparkles, Zap, Trophy, Target, Rocket, Shield, Heart, Users, Award, CheckCircle, Settings, Terminal, Database } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { allCourseLevels, Level, freeLessonsCount } from "@/lib/courseLevels";
import { useTranslate } from "@/hooks/useTranslate";
import { getTotalLessonsCount } from "@/lib/getLessonsCount";
import { getTranslatedContent } from "@/lib/translateContent";
import CourseSwitcher from "@/components/CourseSwitcher";

interface CourseCategory {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  total_lessons: number;
  display_order: number;
  video_minutes?: number;
  text_pages?: number;
  practice_tasks?: number;
}

// Icon mapping for localStorage compatibility
const iconMap: Record<string, any> = {
  'Sparkles': Sparkles,
  'TrendingUp': TrendingUp,
  'Code': Code,
  'Lock': Lock,
  'Settings': Settings,
  'Terminal': Terminal,
  'Database': Database,
  'Zap': Zap,
  'Trophy': Trophy,
  'Target': Target,
  'Rocket': Rocket,
  'Shield': Shield,
  'Heart': Heart,
  'Users': Users,
  'Award': Award
};

export default function CoursesPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { translate } = useTranslate();
  const [allLevels, setAllLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CourseCategory | null>(null);

  // Helper function to get translated content
  const getTranslated = (level: Level) => {
    if (level.translations && level.translations[language]) {
      return level.translations[language];
    }
    // Fallback to original
    return { title: level.title, description: level.description };
  };


  useEffect(() => {
    // Load courses from API (Supabase)
    const loadCourses = async () => {
      try {
        console.log('📡 Loading courses from API...');
        const response = await fetch('/api/courses');
        const data = await response.json();
        
        if (data.courses) {
          console.log('✅ Loaded', data.courses.length, 'courses from database');
          // Преобразуем в формат который ожидает приложение
          const formattedCourses = data.courses.map((course: any) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            difficulty: course.difficulty,
            topics: course.topics || [],
            category: course.category,
            icon: course.icon,
            blockName: course.block_name,
            practice: course.practice || false,
            practiceDescription: course.practice_description,
            isFree: course.is_free || false,
            courseCategoryId: course.course_category_id, // ← КРИТИЧЕСКИЙ ФИКС!
            translations: course.translations || {},
            displayOrder: course.display_order || course.id,
            images: course.images || [],
            videos: course.videos || []
          }));
          
          // СОРТИРОВКА: По display_order (порядок который выбрал админ)
          // Бесплатные и платные могут быть в ЛЮБОМ порядке
          const sortedCourses = formattedCourses.sort((a: any, b: any) => {
            return a.displayOrder - b.displayOrder;
          });
          
          console.log('📊 Sorted courses by display order');
          
          // ВАЖНО: Логируем бесплатные уроки для отладки
          const freeLessons = sortedCourses.filter((c: any) => c.isFree);
          const paidLessons = sortedCourses.filter((c: any) => !c.isFree);
          console.log('🎁 Free lessons:', freeLessons.map((l: any) => `#${l.id}: ${l.title}`));
          console.log('💰 Paid lessons:', paidLessons.map((l: any) => `#${l.id}: ${l.title}`));
          
          setAllLevels(sortedCourses);
          
          // Если база пустая - показываем сообщение
          if (data.courses.length === 0) {
            console.log('ℹ️ Database is empty - no courses to display');
          }
        } else {
          console.log('⚠️ No courses data, showing empty list');
          setAllLevels([]);
        }
      } catch (error) {
        console.error('❌ Error loading courses:', error);
        setAllLevels([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCourses();
    
    // Listen for changes from admin panel
    const handleCourseLevelsUpdate = () => {
      console.log('🔄 Courses updated, reloading...');
      loadCourses();
    };
    
    window.addEventListener('courseLevelsUpdated', handleCourseLevelsUpdate);
    
    return () => {
      window.removeEventListener('courseLevelsUpdated', handleCourseLevelsUpdate);
    };
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "foundation": return "from-indigo-500 to-blue-500";
      case "html": return "from-orange-500 to-red-500";
      case "css": return "from-pink-500 to-purple-500";
      case "javascript": return "from-yellow-500 to-orange-500";
      case "typescript": return "from-blue-600 to-cyan-600";
      case "react": return "from-cyan-500 to-blue-500";
      case "nextjs": return "from-gray-700 to-gray-900";
      case "nodejs": return "from-green-600 to-emerald-600";
      case "databases": return "from-purple-600 to-indigo-600";
      case "games": return "from-green-500 to-emerald-500";
      case "apis": return "from-blue-500 to-indigo-500";
      case "deployment": return "from-red-500 to-pink-500";
      case "advanced": return "from-violet-500 to-purple-600";
      case "practice": return "from-amber-500 to-yellow-500";
      default: return "from-blue-500 to-purple-500";
    }
  };

  const isLevelUnlocked = (levelId: number, isFree?: boolean, index?: number) => {
    // НОВАЯ ЛОГИКА - проверяем по порядку в массиве, не по ID!
    
    // Защита от undefined index
    const lessonIndex = index ?? 0;
    
    // КРИТИЧНО: Если идет загрузка авторизации, разблокируем первый урок
    // чтобы избежать мерцания интерфейса
    if (authLoading) {
      return lessonIndex === 0;
    }
    
    // 1. Для НЕ залогиненных: только первый урок открыт
    if (!user) {
      console.log(`🔓 Урок ${levelId} (индекс ${lessonIndex}): НЕ залогинен -> ${lessonIndex === 0 ? 'OPEN' : 'LOCKED'}`);
      return lessonIndex === 0;
    }
    
    // 2. Проверяем оплату ЭТОГО курса (категории)
    const isCoursePaid = user.subscription_status === 'premium' || 
                         user.paidCourses?.includes(activeCategory?.id || 0);
    
    // Для залогиненных БЕЗ оплаты этого курса:
    //    - Бесплатные уроки открыты по порядку
    //    - Платные закрыты (требуют оплату)
    if (!isCoursePaid) {
      // Платные уроки ВСЕГДА заблокированы без оплаты
      if (!isFree) {
        console.log(`🔓 Урок ${levelId} (индекс ${lessonIndex}): БЕЗ оплаты, платный -> LOCKED`);
        return false;
      }
      
      // Первый БЕСПЛАТНЫЙ урок открыт
      if (lessonIndex === 0 && isFree) {
        console.log(`🔓 Урок ${levelId} (индекс ${lessonIndex}): БЕЗ оплаты, первый бесплатный -> OPEN`);
        return true;
      }
      
      // Остальные бесплатные уроки - по порядку (предыдущий должен быть пройден)
      if (isFree && lessonIndex > 0) {
        const previousLesson = allLevels[lessonIndex - 1];
        const result = previousLesson ? user.completedLessons.includes(previousLesson.id) : false;
        console.log(`🔓 Урок ${levelId} (индекс ${lessonIndex}): БЕЗ оплаты, бесплатный -> ${result ? 'OPEN' : 'LOCKED'}`);
        return result;
      }
      
      return false;
    }
    
    // 3. Для залогиненных С подпиской:
    //    - Урок открыт если предыдущий по порядку пройден ИЛИ если это текущий непройденный
    if (lessonIndex === 0) {
      console.log(`🔓 Урок ${levelId} (индекс ${lessonIndex}): С подпиской, первый -> OPEN`);
      return true;
    }
    
    // Проверяем предыдущий урок по порядку в массиве, не по ID!
    const previousLesson = allLevels[lessonIndex - 1];
    const isPreviousCompleted = previousLesson ? user.completedLessons.includes(previousLesson.id) : false;
    const isCurrentCompleted = user.completedLessons.includes(levelId);
    const result = isPreviousCompleted || isCurrentCompleted;
    
    console.log(`🔓 Урок ${levelId} (индекс ${lessonIndex}): С подпиской -> ${result ? 'OPEN' : 'LOCKED'} (предыдущий урок ${previousLesson?.id} пройден: ${isPreviousCompleted}, текущий пройден: ${isCurrentCompleted})`);
    console.log(`   👤 Пройденные уроки: [${user.completedLessons.join(', ')}]`);
    
    return result;
  };

  const isLevelCompleted = (levelId: number) => {
    if (!user) return false;
    return user.completedLessons.includes(levelId);
  };

  // Найти следующий непройденный урок
  const findNextIncompleteLesson = () => {
    if (!user || allLevels.length === 0) return null;
    
    // Ищем первый урок который не пройден
    for (const level of allLevels) {
      if (!user.completedLessons.includes(level.id)) {
        return level.id;
      }
    }
    
    // Если все уроки пройдены, возвращаем null
    return null;
  };

  // Переход к следующему уроку по клику на кнопку
  const scrollToNextLesson = () => {
    const nextLessonId = findNextIncompleteLesson();
    
    if (nextLessonId) {
      const element = document.getElementById(`lesson-${nextLessonId}`);
      if (element) {
        console.log(`🎯 Переход к уроку ${nextLessonId} по кнопке`);
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  };

  return (
    <div className="min-h-screen py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold md:text-5xl">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              {t.courses.path_title}
            </span>
          </h1>
          <p className="text-lg text-gray-300 font-medium mb-2">
            {t.courses.subtitle} <span className="font-bold text-purple-400">AI</span>
          </p>
          <p className="text-base text-gray-400">
            {t.courses.create_with} <span className="text-orange-400">{t.courses.websites}</span>, <span className="text-green-400">{t.courses.games}</span>, <span className="text-cyan-400">{t.courses.apps}</span> {t.courses.without_code}
          </p>
        </div>

        {/* Переключатель курсов */}
        <CourseSwitcher 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Статистика ВСЕГО курса - ВРЕМЕННЫЕ ЗНАЧЕНИЯ */}
        {!isLoading && !authLoading && activeCategory && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {/* Видео */}
              <div className="flex items-center gap-1.5">
                <span>🎥</span>
                <span className="text-blue-400 font-semibold">
                  {activeCategory.slug === 'websites' ? '3ч 0м' :
                   activeCategory.slug === 'apps' ? '2ч 0м' :
                   activeCategory.slug === 'games' ? '2ч 30м' :
                   activeCategory.slug === 'payments' ? '1ч 30м' : '0ч 0м'}
                </span>
                <span className="text-gray-500">видео</span>
              </div>
              {/* Текст */}
              <div className="flex items-center gap-1.5">
                <span>📄</span>
                <span className="text-purple-400 font-semibold">
                  {activeCategory.slug === 'websites' ? '25' :
                   activeCategory.slug === 'apps' ? '18' :
                   activeCategory.slug === 'games' ? '20' :
                   activeCategory.slug === 'payments' ? '15' : '0'}
                </span>
                <span className="text-gray-500">листов текста</span>
              </div>
              {/* Практика */}
              <div className="flex items-center gap-1.5">
                <span>✍️</span>
                <span className="text-green-400 font-semibold">
                  {activeCategory.slug === 'websites' ? '12' :
                   activeCategory.slug === 'apps' ? '8' :
                   activeCategory.slug === 'games' ? '10' :
                   activeCategory.slug === 'payments' ? '6' : '0'}
                </span>
                <span className="text-gray-500">практических задач</span>
              </div>
            </div>
          </div>
        )}

        {/* Кнопка перехода к следующему уроку */}
        {!isLoading && !authLoading && user && findNextIncompleteLesson() && (
          <div className="mb-8 text-center">
            <button
              onClick={scrollToNextLesson}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              <span className="text-lg">🎯</span>
              Перейти к следующему уроку
            </button>
          </div>
        )}

        {/* Skeleton Loader */}
        {(isLoading || authLoading) && (
          <div className="relative px-4 md:px-8 space-y-8">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div 
                key={num} 
                className={`flex items-center gap-6 ${num % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className="w-full max-w-md">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border-2 border-gray-700 p-6 animate-pulse">
                    {/* Icon skeleton */}
                    <div className="mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-600" />
                    
                    {/* Title skeleton */}
                    <div className="mb-3 h-6 w-3/4 rounded bg-gradient-to-r from-gray-700 to-gray-600" />
                    
                    {/* Description skeleton */}
                    <div className="mb-2 h-4 w-full rounded bg-gradient-to-r from-gray-700 to-gray-600" />
                    <div className="mb-4 h-4 w-5/6 rounded bg-gradient-to-r from-gray-700 to-gray-600" />
                    
                    {/* Badges skeleton */}
                    <div className="flex gap-2">
                      <div className="h-6 w-20 rounded-full bg-gradient-to-r from-gray-700 to-gray-600" />
                      <div className="h-6 w-24 rounded-full bg-gradient-to-r from-gray-700 to-gray-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Уровни волной - слева направо */}
        {!isLoading && !authLoading && (
        <div className="relative px-4 md:px-8">
          {allLevels
            .filter(level => {
              // Фильтруем по выбранной категории курса
              if (!activeCategory) return true;
              return level.courseCategoryId === activeCategory.id;
            })
            .map((level, index) => {
            // Проверяем оплату этого курса
            const isThisCoursePaidCheck = user?.subscription_status === 'premium' || 
                                          user?.paidCourses?.includes(activeCategory?.id || 0);
            
            // Фильтруем уроки этой категории
            const filteredLevels = allLevels.filter(l => l.courseCategoryId === activeCategory?.id);
            const hasFreeLesson = filteredLevels.some(l => l.isFree);
            
            // Показываем карточку оплаты:
            // 1. Если нет бесплатных уроков - показать ПЕРЕД первым платным
            // 2. Или после последнего бесплатного урока
            const isFirstPaidWithoutFree = !hasFreeLesson && index === 0 && !level.isFree;
            const isLastFreeLesson = level.isFree && 
              (index === filteredLevels.length - 1 || !filteredLevels[index + 1]?.isFree);
            const hasMorePaidLessons = filteredLevels.some((l, i) => i > index && !l.isFree);
            
            // Show CTA если курс не оплачен
            const showCTABefore = isFirstPaidWithoutFree && user && !isThisCoursePaidCheck;
            const showCTAAfter = isLastFreeLesson && hasMorePaidLessons && user && !isThisCoursePaidCheck;
            const unlocked = isLevelUnlocked(level.id, level.isFree, index);
            const completed = isLevelCompleted(level.id);
            // Handle icon from localStorage or original source
            const IconComponent = typeof level.icon === 'function' 
              ? level.icon 
              : typeof level.icon === 'string'
              ? iconMap[level.icon] || Sparkles
              : Sparkles;
            const isLeft = index % 2 === 0;
            const showPath = index < allLevels.length - 1;
            const nextIsLeft = (index + 1) % 2 === 0;
            // Показываем заголовок блока только если это первый урок блока или блок изменился
            const isFirstInBlock = index === 0 || level.blockName !== allLevels[index - 1].blockName;
            const showBlockHeader = level.blockName && isFirstInBlock;

            // Определяем цену для карточки
            const isPaymentCourse = activeCategory?.slug?.includes('payment') || 
                                    activeCategory?.title?.toLowerCase().includes('платёж') || 
                                    activeCategory?.id === 4;
            const cardPrice = isPaymentCourse ? 49.99 : 249.99;
            const cardDiscountPrice = isPaymentCourse ? null : 174.99;
            
            return (
              <div key={level.id} id={`lesson-${level.id}`} className="relative mb-20">
                {/* Карточка оплаты ПЕРЕД первым платным уроком (если нет бесплатных) */}
                {showCTABefore && (
                  <div className="mb-16 flex justify-center">
                    <Card className="glass premium-shadow border-4 border-orange-500/50 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 max-w-lg w-full">
                      <CardContent className="p-8">
                        <div className="text-center mb-6">
                          <div className="text-5xl mb-4">🔒</div>
                          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                            Курс "{activeCategory?.title}" требует оплаты
                          </h3>
                          <p className="text-gray-300 text-base">
                            Этот курс полностью платный. Оплатите чтобы получить доступ ко всем урокам.
                          </p>
                        </div>

                        <div className="text-center mb-6">
                          <span className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            ${cardPrice}
                          </span>
                          <p className="text-sm text-gray-400 mt-2">Единоразовый платеж • Пожизненный доступ</p>
                        </div>

                        {cardDiscountPrice && (
                          <div className="mb-6 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                            <p className="text-sm text-orange-400 font-bold text-center">
                              🎬 Скидка за рекламу: <span className="line-through">${cardPrice}</span> → <span className="text-green-400">${cardDiscountPrice}</span>
                            </p>
                          </div>
                        )}

                        <div className="text-center">
                          <Link href={`/payment/course/${activeCategory?.id || 1}`}>
                            <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-5 rounded-xl font-bold transition-all transform hover:scale-105 w-full premium-shadow text-xl flex items-center justify-center gap-3">
                              <Zap className="h-6 w-6" />
                              Купить курс за ${cardPrice}
                            </button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Заголовок блока - показываем ОДИН РАЗ в начале блока */}
                {showBlockHeader && (
                  <div className="mb-12 mt-16 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border-2 border-purple-400 premium-shadow">
                      <Star className="h-5 w-5 text-purple-400" />
                      <span className="text-lg font-bold text-purple-400">{level.blockName}</span>
                    </div>
                  </div>
                )}

                {/* Линия волной */}
                {showPath && (
                  <div className="absolute top-28 left-0 right-0 h-24 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`gradient-${level.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={completed ? "#10b981" : unlocked ? "#a855f7" : "#6b7280"} />
                          <stop offset="100%" stopColor={completed ? "#34d399" : unlocked ? "#ec4899" : "#9ca3af"} />
                        </linearGradient>
                      </defs>
                      <path
                        d={isLeft 
                          ? nextIsLeft 
                            ? "M 150 50 Q 500 -50, 850 50" 
                            : "M 150 50 Q 500 150, 850 50"
                          : nextIsLeft
                            ? "M 850 50 Q 500 -50, 150 50"
                            : "M 850 50 Q 500 150, 150 50"
                        }
                        stroke={`url(#gradient-${level.id})`}
                        strokeWidth="3"
                        fill="none"
                        className="drop-shadow-lg"
                      />
                    </svg>
                  </div>
                )}

                {/* Контейнер уровня */}
                <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
                  <div className="relative">
                    <Link 
                      href={`/courses/level/${level.id}`}
                      onClick={(e) => {
                        // НОВАЯ ЛОГИКА КЛИКА:
                        
                        // 1. Если не залогинен → редирект на логин (для ВСЕХ уроков)
                        if (!user) {
                          e.preventDefault();
                          localStorage.setItem('redirectAfterLogin', `/courses/level/${level.id}`);
                          router.push("/login");
                          return;
                        }
                        
                        // 2. Если урок заблокирован - не даем кликнуть
                        if (!unlocked) {
                          e.preventDefault();
                          
                          // Если платный урок и не оплатил ЭТОТ курс
                          const isThisCoursePaid = user.subscription_status === 'premium' || 
                                                    user.paidCourses?.includes(activeCategory?.id || 0);
                          if (!level.isFree && !isThisCoursePaid) {
                            router.push(`/payment/course/${activeCategory?.id || 1}`);
                            return;
                          }
                          
                          // Если просто не пройден предыдущий урок
                          const previousLesson = allLevels[index - 1];
                          if (previousLesson) {
                            alert(`⚠️ Сначала пройдите урок "${previousLesson.title}"!`);
                          } else {
                            alert(`⚠️ Сначала пройдите предыдущий урок!`);
                          }
                          return;
                        }
                        
                        // 3. Урок разблокирован - разрешаем переход
                      }}  
                    >
                      {/* Круг */}
                      <div className={`relative flex h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 items-center justify-center rounded-full border-4 transition-all duration-300 glass ${
                        completed 
                          ? 'border-green-400 bg-gradient-to-br from-green-500/30 to-emerald-500/30 hover:scale-110 shadow-xl shadow-green-500/60 animate-pulse' 
                          : unlocked 
                            ? 'border-purple-400 hover:scale-110 neon-glow cursor-pointer' 
                            : 'border-gray-600 opacity-50 cursor-not-allowed'
                      }`}>
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getCategoryColor(level.category)} opacity-20`} />
                        
                        {/* Иконка */}
                        <div className="relative z-10">
                          {completed ? (
                            <div className="relative">
                              <Check className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-green-400" strokeWidth={3} />
                              {/* Дополнительная большая галочка для пройденных */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-green-300 animate-ping opacity-75" />
                              </div>
                            </div>
                          ) : unlocked ? (
                            <IconComponent className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-purple-400" />
                          ) : (
                            <Lock className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 text-gray-500" />
                          )}
                        </div>

                        {/* Номер уровня / Бейдж "Пройден" */}
                        {completed ? (
                          <div className="absolute -top-2 -right-2 flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white border-2 border-green-300 shadow-lg">
                            ✓
                          </div>
                        ) : (
                          <div className={`absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                            unlocked ? 'bg-purple-500 text-white' : 'bg-gray-600 text-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                      </div>

                      {/* Карточка с информацией */}
                      {!completed && level.isFree && (
                        <div className={`absolute top-0 ${isLeft ? 'left-32' : 'right-32'} w-80 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
                          <Card className="glass premium-shadow border-2 border-purple-400">
                            <CardContent className="p-4">
                              <h3 className="font-bold text-sm mb-2">{getTranslated(level).title}</h3>
                              <p className="text-xs text-gray-400 mb-2 whitespace-pre-wrap">{getTranslated(level).description}</p>
                              <div className="flex flex-wrap gap-1">
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500">
                                  🎁 Бесплатный
                                </span>
                                {level.topics.slice(0, 3).map((topic, i) => (
                                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                      {!completed && !level.isFree && (
                        <div className={`absolute top-0 ${isLeft ? 'left-32' : 'right-32'} w-80 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
                          <Card className="glass premium-shadow border-2 border-orange-500 bg-gradient-to-br from-orange-500/10 to-red-500/10">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Lock className="h-4 w-4 text-orange-400" />
                                <h3 className="font-bold text-sm text-orange-400">🔒 Платный урок</h3>
                              </div>
                              <p className="text-xs text-gray-300 mb-2">
                                Этот урок доступен после покупки курса за $249.99
                              </p>
                              <p className="text-xs text-orange-400 font-bold">
                                Пройди бесплатные уроки, затем купи полный доступ!
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Link>

                    {/* Название под кругом */}
                    <div className={`mt-4 ${isLeft ? 'text-left' : 'text-right'} max-w-[120px] sm:max-w-[140px] md:max-w-[160px]`}>
                      <p className="text-xs text-gray-400 mb-1">{t.courses.lesson} {index + 1}</p>
                      <p className="text-xs sm:text-sm font-bold line-clamp-2">{getTranslated(level).title}</p>
                      
                      {/* Статус урока */}
                      {completed ? (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-400/50">
                          <Check className="h-3 w-3 text-green-400" />
                          <span className="text-xs font-bold text-green-400">✅ Пройден</span>
                        </div>
                      ) : unlocked ? (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-400/50">
                          <span className="text-xs font-bold text-orange-400">⏳ Не пройден</span>
                        </div>
                      ) : (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-500/20 border border-gray-400/50">
                          <Lock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-bold text-gray-400">🔒 Закрыто</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Premium upgrade card after free lessons - показываем ОДИН РАЗ */}
                {showCTAAfter && (() => {
                  // Определяем цену курса
                  const isPaymentCourse = activeCategory?.slug?.includes('payment') || 
                                          activeCategory?.title?.toLowerCase().includes('платёж') || 
                                          activeCategory?.id === 4;
                  const price = isPaymentCourse ? 49.99 : 249.99;
                  const discountPrice = isPaymentCourse ? null : 174.99;
                  
                  return (
                  <div className="my-16 flex justify-center">
                    <Card className="glass premium-shadow border-4 border-green-500/50 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 max-w-lg w-full relative overflow-hidden">
                      <CardContent className="p-8">
                        <div className="text-center mb-6">
                          <div className="text-5xl mb-4">{activeCategory?.icon || '🎓'}</div>
                          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            🔓 Разблокировать курс "{activeCategory?.title}"
                          </h3>
                          <p className="text-gray-300 text-base mb-2">
                            Бесплатные уроки пройдены! Получите доступ к остальным урокам.
                          </p>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-6">
                          <span className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            ${price}
                          </span>
                          <p className="text-sm text-gray-400 mt-2">Единоразовый платеж • Пожизненный доступ</p>
                        </div>

                        {/* Скидка за рекламу */}
                        {discountPrice && (
                          <div className="mb-6 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                            <p className="text-sm text-orange-400 font-bold text-center">
                              🎬 Скидка: <span className="line-through">${price}</span> → <span className="text-green-400">${discountPrice}</span>
                            </p>
                            <p className="text-xs text-gray-400 text-center mt-1">
                              Опубликуй наше рекламное видео, набери 1000+ просмотров
                            </p>
                            <Link 
                              href="/payment#promo-discount"
                              className="block mt-2 text-center text-xs py-1 px-2 rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all"
                            >
                              Узнать подробнее →
                            </Link>
                          </div>
                        )}

                        {/* Features */}
                        <div className="mb-6 space-y-2">
                          <div className="flex items-center gap-2 text-gray-300">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span>Все уроки курса "{activeCategory?.title}"</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span>Практические задания</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span>Доступ навсегда</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div className="text-center">
                          <Link href={`/payment/course/${activeCategory?.id || 1}`}>
                            <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-5 rounded-xl font-bold transition-all transform hover:scale-105 w-full premium-shadow text-xl flex items-center justify-center gap-3">
                              <Zap className="h-6 w-6" />
                              Купить курс за ${price}
                            </button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
