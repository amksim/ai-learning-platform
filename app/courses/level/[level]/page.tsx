"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle, ArrowRight, ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { Level } from "@/lib/courseLevels";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getTranslatedContent } from "@/lib/translateContent";
import LessonImage from "@/components/LessonImage";
import LessonVideo from "@/components/LessonVideo";

// Функция для парсинга текста и создания кликабельных ссылок
const parseTextWithLinks = (text: string) => {
  // Regex для поиска URL
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    // Если это URL
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 transition-all font-medium bg-blue-500/10 px-1.5 py-0.5 rounded hover:bg-blue-500/20"
        >
          {part}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }
    // Обычный текст
    return <span key={index}>{part}</span>;
  });
};

// Lesson content is now loaded from localStorage
// Default lessons are managed in admin panel
const lessonContent: Record<string, any> = {
  "1": {
    title: "Welcome! Complete the course in 2-3 days",
    sections: [
      {
        title: "Welcome to the course!",
        content: "You're starting your journey of creating programs with AI. The course lasts only 2-3 days, but you'll gain skills to create websites, games, and applications without coding knowledge!",
      },
      {
        title: "What awaits you?",
        content: "Complete course from tool installation to publishing finished projects. You'll learn to describe your ideas in plain language, and AI will create a program in seconds.",
        tips: [
          "Websites of any complexity",
          "Games and entertainment apps",
          "Business tools and utilities",
          "Online stores and services",
        ],
      },
      {
        title: "Инвестиция в будущее",
        content: "Курс стоит $249.99 (скидка 33%, обычно $599). Пожизненный доступ ко всем урокам. Скидка действует 1 час с первого посещения!",
      },
    ],
    tasks: [
      "Изучи вводную часть",
      "Пойми, что ты сможешь создавать",
      "Переходи к следующему уроку",
    ],
  },
  "2": {
    title: "Какие программы ты сможешь создавать",
    sections: [
      {
        title: "Сайты",
        content: "Создавай личные страницы, портфолио, бизнес сайты, лендинги, интернет-магазины, блоги и корпоративные системы.",
      },
      {
        title: "Игры",
        content: "Логические игры, головоломки, аркады, экшн игры, стратегии, 3D проекты и многопользовательские игры.",
      },
      {
        title: "Приложения",
        content: "Калькуляторы, конвертеры, планировщики, органайзеры, чаты, мессенджеры, финансовые инструменты и бизнес утилиты.",
      },
      {
        title: "Как это работает?",
        content: "1. Придумываешь идею\n2. Описываешь обычным языком\n3. AI создаёт программу\n4. Публикуешь в интернет\n5. Зарабатываешь!",
      },
    ],
    tasks: [
      "Подумай, какую программу хочешь создать",
      "Представь её функционал",
      "Готовься к следующему уроку",
    ],
  },
  "3": {
    title: "Что ты будешь уметь делать",
    sections: [
      {
        title: "Навыки создания",
        content: "Ты научишься придумывать идеи, описывать их AI, получать готовые программы, публиковать их и даже продавать!",
        tips: [
          "Придумать идею программы",
          "Описать её AI обычным языком",
          "Получить готовую программу",
          "Опубликовать в интернете",
          "Продавать или использовать для бизнеса",
        ],
      },
      {
        title: "Технические знания",
        content: "Поймёшь как работают сайты, приложения, базы данных, внешние сервисы, оптимизация и безопасность.",
      },
      {
        title: "Возможности заработка",
        content: "Фриланс ($30-100/час), продажа готовых решений ($249.99-2000), платные сервисы ($200-2000/месяц), свой бизнес!",
      },
      {
        title: "Готов начать?",
        content: "Первые 3 урока бесплатны! Чтобы продолжить обучение и получить доступ к остальным 217 урокам, нужно оплатить курс.",
      },
    ],
    tasks: [
      "Пройди все 3 бесплатных урока",
      "Оцени качество обучения",
      "Купи полный доступ за $249.99",
    ],
  },
};

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useLanguage();
  const { user, updateProgress, loading: authLoading } = useAuth();
  const [currentLevel, setCurrentLevel] = useState<any>(null);
  const [allLevels, setAllLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const levelId = parseInt(params.level as string);

  useEffect(() => {
    // Load courses from API
    const loadCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        
        if (data.courses) {
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
            translations: course.translations || {},
            displayOrder: course.display_order || course.id,
            images: course.images || [],
            videos: course.videos || []
          }));
          
          // СОРТИРОВКА: Бесплатные наверху, потом платные
          const sortedCourses = formattedCourses.sort((a: any, b: any) => {
            if (a.isFree && !b.isFree) return -1;
            if (!a.isFree && b.isFree) return 1;
            return a.displayOrder - b.displayOrder;
          });
          
          setAllLevels(sortedCourses);
          const level = sortedCourses.find((l: any) => l.id === levelId);
          setCurrentLevel(level);
          
          // Find current lesson position in sorted array
          const lessonIndex = sortedCourses.findIndex((l: any) => l.id === levelId);
          const previousLesson = lessonIndex > 0 ? sortedCourses[lessonIndex - 1] : null;
          
          // ВАЖНО: Логируем для отладки
          console.log('🔍 Lesson Access Check:', {
            lessonId: levelId,
            lessonPosition: lessonIndex + 1,
            lessonTitle: level?.title,
            isFree: level?.isFree,
            previousLessonId: previousLesson?.id,
            userLoggedIn: !!user,
            userHasPaid: user?.hasPaid
          });
          
          // ВАЖНО: Теперь ВСЕ уроки требуют логин (для сохранения прогресса)
          // НО не редиректим пока идёт загрузка пользователя
          if (!authLoading && !user) {
            console.log('❌ User not logged in - redirecting to /login');
            router.push("/login");
            return;
          }
          
          // Если ещё идёт загрузка авторизации, не проверяем доступ
          if (authLoading) {
            console.log('⏳ Auth loading, waiting...');
            return;
          }
          
          // На этом этапе user точно существует (прошли проверку выше)
          if (!user) return;
          
          // Free lessons доступны залогиненным, но по порядку!
          if (level?.isFree) {
            // Проверяем последовательность: если это не первый урок, проверяем прохождение предыдущего
            if (previousLesson && !user.completedLessons.includes(previousLesson.id)) {
              console.log('❌ Previous lesson not completed - redirecting to /courses');
              alert(`⚠️ Сначала пройдите предыдущий урок: "${previousLesson.title}"!`);
              router.push("/courses");
              return;
            }
            console.log('✅ Free lesson - access granted');
            setLoading(false);
            
            // КРИТИЧНО: Автоматически сохраняем прогресс при загрузке урока
            if (user && !user.completedLessons.includes(levelId)) {
              console.log('📝 Автоматически сохраняем прогресс урока:', levelId);
              try {
                await updateProgress("main-course", levelId);
                console.log('✅ Прогресс автоматически сохранен!');
              } catch (error) {
                console.error('❌ Ошибка автосохранения прогресса:', error);
              }
            }
            return;
          }
          
          // Paid lessons require payment + sequential completion
          if (!user.hasPaid) {
            console.log('❌ Paid lesson - user has not paid, redirecting to /payment');
            router.push("/payment");
            return;
          }
          
          // Проверяем последовательность для платных уроков
          if (previousLesson && !user.completedLessons.includes(previousLesson.id)) {
            console.log('❌ Previous lesson not completed - redirecting to /courses');
            alert(`⚠️ Сначала пройдите предыдущий урок: "${previousLesson.title}"!`);
            router.push("/courses");
            return;
          }
          
          console.log('✅ Paid lesson - user has access');
          setLoading(false);
          
          // КРИТИЧНО: Автоматически сохраняем прогресс при загрузке урока
          // Это делает урок пройденным сразу при просмотре
          if (user && !user.completedLessons.includes(levelId)) {
            console.log('📝 Автоматически сохраняем прогресс урока:', levelId);
            try {
              await updateProgress("main-course", levelId);
              console.log('✅ Прогресс автоматически сохранен!');
            } catch (error) {
              console.error('❌ Ошибка автосохранения прогресса:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        setLoading(false);
      }
    };
    
    loadCourses();
  }, [user, router, levelId, updateProgress, authLoading]);

  // Calculate lesson navigation based on display_order, not ID
  const currentIndex = allLevels.findIndex((l: any) => l.id === levelId);
  const currentLessonNumber = currentIndex + 1; // Position in sorted array (1-based)
  const nextLesson = allLevels[currentIndex + 1];
  const hasNextLesson = !!nextLesson;
  const isLastLesson = currentIndex === allLevels.length - 1;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  // Get translated content
  const lesson = currentLevel ? (() => {
    const translated = currentLevel.translations && currentLevel.translations[language]
      ? currentLevel.translations[language]
      : { title: currentLevel.title, description: currentLevel.description };
    
    return {
      title: translated.title,
      sections: [
        {
          title: translated.title,
          content: translated.description,
        },
        ...(currentLevel.practiceDescription ? [{
          title: "Практическое задание",
          content: currentLevel.practiceDescription,
        }] : [])
      ],
      tasks: currentLevel.topics || [],
    };
  })() : (lessonContent[levelId.toString()] || {
    title: `Урок ${levelId}`,
    sections: [
      {
        title: "Контент урока",
        content: `Это урок #${levelId}. Здесь будет полный контент урока с объяснениями и примерами.`,
      },
    ],
    tasks: [
      "Изучить теоретическую часть",
      "Выполнить практическое задание",
      "Перейти к следующему уроку",
    ],
  })

  const handleComplete = () => {
    if (user) {
      updateProgress("main-course", levelId);
      // Используем полную перезагрузку чтобы прогресс обновился визуально
      setTimeout(() => {
        window.location.href = "/courses";
      }, 100);
    } else {
      router.push("/courses");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden py-20">
      {/* Animated premium background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/40 to-black" />
        <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 blur-3xl animate-pulse" />
        <div className="absolute right-1/4 top-40 h-96 w-96 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute left-1/3 bottom-20 h-64 w-64 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 opacity-15 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute right-1/3 bottom-40 h-80 w-80 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 opacity-10 blur-3xl animate-pulse" style={{ animationDelay: "3s" }} />
      </div>
      
      <div className="container mx-auto max-w-4xl px-4 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/courses")}
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад к курсам
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {currentLessonNumber}
            </div>
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">{lesson.title}</h1>
              <p className="text-muted-foreground">Уровень {currentLessonNumber}</p>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="space-y-6 mb-8">
          {lesson.sections.filter((section: any) => section.title !== "Практическое задание").map((section: any, index: number) => (
            <Card 
              key={index} 
              className="premium-shadow border-2 border-purple-400/30 shadow-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </p>
                
                {section.tips && (
                  <div className="rounded-lg bg-accent/50 p-4">
                    <p className="font-medium mb-2">💡 Советы:</p>
                    <ul className="space-y-1">
                      {section.tips.map((tip: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Lesson Images - Grid Layout (2 columns) */}
                {currentLevel?.images && currentLevel.images.length > 0 && (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentLevel.images.map((image: any, imgIndex: number) => (
                        <LessonImage 
                          key={`img-${imgIndex}`} 
                          image={image}
                          allImages={currentLevel.images}
                          currentIndex={imgIndex}
                          language={language}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Lesson Videos - Grid Layout (2 columns) */}
                {currentLevel?.videos && currentLevel.videos.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span>🎬</span> Видео материалы
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentLevel.videos.map((video: any, videoIndex: number) => (
                        <LessonVideo 
                          key={`video-${videoIndex}`} 
                          video={video} 
                          language={language}
                          videoIndex={videoIndex}
                          lessonId={currentLevel.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Practice Tasks - Combined and Beautiful */}
        {(lesson.sections.find((s: any) => s.title === "Практическое задание") || lesson.tasks.length > 0) && (
          <Card className="mb-8 border-2 border-purple-500/30 bg-gradient-to-br from-gray-800/80 via-purple-900/20 to-gray-800/80 premium-shadow backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Практическое задание
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Выполни это задание, чтобы закрепить материал
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lesson.sections.find((s: any) => s.title === "Практическое задание") && (
                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-700/40 via-purple-800/20 to-gray-700/40 border border-purple-400/30 backdrop-blur-sm">
                  <p className="text-base leading-relaxed text-gray-200">
                    {parseTextWithLinks(lesson.sections.find((s: any) => s.title === "Практическое задание")?.content || "")}
                  </p>
                </div>
              )}
              
              {lesson.tasks.length > 0 && (
                <div className="space-y-3 mt-4">
                  <p className="text-sm font-semibold text-purple-400">📝 Шаги выполнения:</p>
                  <ul className="space-y-2">
                    {lesson.tasks.map((task: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-purple-900/30 transition-all border border-purple-500/20">
                        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white shadow-md">
                          {index + 1}
                        </div>
                        <span className="text-gray-300 pt-0.5">{parseTextWithLinks(task)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Support Section - на каждом уроке */}
        <Card className="mb-8 border-2 border-blue-500/30 bg-gradient-to-br from-blue-900/20 via-cyan-900/10 to-blue-900/20 premium-shadow backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                  <span className="text-3xl">💬</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                    Остались вопросы?
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Если что-то непонятно — обратитесь в поддержку, мы поможем!
                  </p>
                </div>
              </div>
              <a
                href="https://t.me/AlLearning_Help"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <span className="text-xl">💬</span>
                Написать в поддержку
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/courses")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          
          {/* Show different buttons based on lesson state */}
          {isLastLesson ? (
            // Last lesson - show completion message
            <Card className="glass border-2 border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 premium-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="font-bold text-white mb-1">🎉 Поздравляем!</p>
                  <p className="text-sm text-gray-300">Вы завершили все уроки</p>
                </div>
                <Button 
                  onClick={async () => {
                    if (user) {
                      await updateProgress("main-course", levelId);
                      console.log('✅ Последний урок завершен, прогресс сохранен');
                    }
                    setTimeout(() => {
                      router.push("/profile");
                    }, 100);
                  }}
                  className="ml-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Профиль
                </Button>
              </CardContent>
            </Card>
          ) : hasNextLesson ? (
            // Has next lesson - check if it's paid and user hasn't paid
            (() => {
              const nextIsPaid = nextLesson && !nextLesson.isFree;
              const shouldShowPayment = nextIsPaid && !user?.hasPaid;
              
              if (shouldShowPayment) {
                // Next lesson is paid but user hasn't paid - show payment button
                return (
                  <Button 
                    onClick={async () => {
                      if (user) {
                        await updateProgress("main-course", levelId);
                        console.log('✅ Бесплатный урок завершен, переход на оплату');
                      }
                      router.push("/payment");
                    }}
                    className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    💰 Купить полный курс $249.99
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                );
              }
              
              // Next lesson is available - show next button
              return (
                <Button 
                  onClick={() => {
                    console.log('➡️ Переход к следующему уроку:', nextLesson?.id);
                    // Прогресс уже сохранен автоматически при загрузке урока
                    router.push(`/courses/level/${nextLesson?.id}`);
                  }}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Следующий урок
                  <ArrowRight className="h-4 w-4" />
                </Button>
              );
            })()
          ) : !user?.hasPaid ? (
            // Free lessons ended - show payment button
            <Button 
              onClick={() => router.push("/payment")}
              className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              💰 Купить полный курс $249.99
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            // Default - back to courses
            <Button 
              onClick={() => router.push("/courses")}
              className="gap-2"
            >
              К курсам
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
