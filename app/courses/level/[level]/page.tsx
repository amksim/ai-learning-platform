"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle, ArrowRight, ArrowLeft, BookOpen } from "lucide-react";
import { allCourseLevels, Level, freeLessonsCount } from "@/lib/courseLevels";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getTranslatedContent } from "@/lib/translateContent";

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
        content: "Курс стоит $100 (скидка 33%, обычно $150). Пожизненный доступ ко всем урокам. Скидка действует 1 час с первого посещения!",
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
        content: "Фриланс ($30-100/час), продажа готовых решений ($100-2000), платные сервисы ($200-2000/месяц), свой бизнес!",
      },
      {
        title: "Готов начать?",
        content: "Первые 3 урока бесплатны! Чтобы продолжить обучение и получить доступ к остальным 217 урокам, нужно оплатить курс.",
      },
    ],
    tasks: [
      "Пройди все 3 бесплатных урока",
      "Оцени качество обучения",
      "Купи полный доступ за $100",
    ],
  },
};

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const { t, language } = useLanguage();
  const { user, updateProgress } = useAuth();
  
  const levelId = parseInt(params.level as string);

  useEffect(() => {
    // Load from localStorage to get current levels with free status
    const savedLevels = localStorage.getItem("courseLevels");
    let levels = allCourseLevels;
    if (savedLevels) {
      try {
        levels = JSON.parse(savedLevels);
      } catch (e) {
        console.error("Failed to parse levels", e);
      }
    }
    
    // Find the level to check if it's free
    const level = levels.find(l => l.id === levelId);
    
    // Free lessons don't require login
    if (level?.isFree) {
      return;
    }
    
    // Paid lessons require login and payment
    if (!user) {
      router.push("/login");
      return;
    }
    
    // Check if user has paid for the course
    if (!user.hasPaid) {
      router.push("/payment");
      return;
    }
  }, [user, router, levelId]);

  // Load lesson from localStorage
  const savedLevels = localStorage.getItem("courseLevels");
  let currentLevel = null;
  let allLevels: any[] = [];
  let hasNextLesson = false;
  let nextLessonId = levelId + 1;
  let isLastLesson = false;
  
  if (savedLevels) {
    try {
      allLevels = JSON.parse(savedLevels);
      currentLevel = allLevels.find((l: any) => l.id === levelId);
      
      // Check if next lesson exists
      hasNextLesson = allLevels.some((l: any) => l.id === nextLessonId);
      
      // Check if this is the last lesson
      const maxId = Math.max(...allLevels.map((l: any) => l.id));
      isLastLesson = levelId === maxId;
    } catch (e) {
      console.error("Failed to parse levels", e);
    }
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
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10 py-20">
      <div className="container mx-auto max-w-4xl px-4">
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
              {levelId}
            </div>
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">{lesson.title}</h1>
              <p className="text-muted-foreground">Уровень {levelId}</p>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="space-y-6 mb-8">
          {lesson.sections.filter((section: any) => section.title !== "Практическое задание").map((section: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Practice Tasks - Combined and Beautiful */}
        {(lesson.sections.find((s: any) => s.title === "Практическое задание") || lesson.tasks.length > 0) && (
          <Card className="mb-8 border-2 border-gradient-to-r from-purple-500/30 to-pink-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 premium-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Практическое задание
                  </CardTitle>
                  <CardDescription>
                    Выполни это задание, чтобы закрепить материал
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lesson.sections.find((s: any) => s.title === "Практическое задание") && (
                <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border-2 border-purple-200 dark:border-purple-800">
                  <p className="text-base leading-relaxed font-medium">
                    {lesson.sections.find((s: any) => s.title === "Практическое задание")?.content}
                  </p>
                </div>
              )}
              
              {lesson.tasks.length > 0 && (
                <div className="space-y-3 mt-4">
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">📝 Шаги выполнения:</p>
                  <ul className="space-y-2">
                    {lesson.tasks.map((task: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white shadow-md">
                          {index + 1}
                        </div>
                        <span className="text-muted-foreground pt-0.5">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                  onClick={() => {
                    if (user) {
                      updateProgress("main-course", levelId);
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
              const nextLesson = allLevels.find((l: any) => l.id === nextLessonId);
              const nextIsPaid = nextLesson && !nextLesson.isFree;
              const shouldShowPayment = nextIsPaid && !user?.hasPaid;
              
              if (shouldShowPayment) {
                // Next lesson is paid but user hasn't paid - show payment button
                return (
                  <Button 
                    onClick={() => {
                      if (user) {
                        updateProgress("main-course", levelId);
                      }
                      router.push("/payment");
                    }}
                    className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    💰 Купить полный курс $100
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                );
              }
              
              // Next lesson is available - show next button
              return (
                <Button 
                  onClick={() => {
                    if (user) {
                      updateProgress("main-course", levelId);
                    }
                    router.push(`/courses/level/${nextLessonId}`);
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
              💰 Купить полный курс $100
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
