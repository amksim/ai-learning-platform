"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Check, ArrowLeft, Loader2, Zap, Trophy, Lock } from "lucide-react";

interface CourseCategory {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  total_lessons: number;
}

export default function BuyCoursePagePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params.id);
  const { user, loading: authLoading } = useAuth();
  
  const [course, setCourse] = useState<CourseCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Загружаем информацию о курсе
  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await fetch('/api/course-categories');
        const data = await response.json();
        
        if (data.categories) {
          const foundCourse = data.categories.find((c: CourseCategory) => c.id === courseId);
          setCourse(foundCourse || null);
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  // Проверка авторизации
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Проверка - курс уже оплачен?
  const isAlreadyPaid = user?.paidCourses?.includes(courseId) || user?.subscription_status === 'premium';

  // Определяем цену курса
  // Платёжные системы (slug содержит "payment" или id = 4) = $49.99, остальные = $249.99
  const isPaymentSystemsCourse = course?.slug?.includes('payment') || course?.title?.toLowerCase().includes('платёж') || courseId === 4;
  const coursePrice = isPaymentSystemsCourse ? 49.99 : 249.99;
  const discountPrice = isPaymentSystemsCourse ? null : 174.99; // Скидка только для обычных курсов

  const handlePayment = async () => {
    if (!user || !course || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Создаём платёж через Stripe для конкретного курса
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          courseId: courseId,
          courseName: course.title,
          amount: coursePrice
        })
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Ошибка создания платежа');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Ошибка при оплате');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">Курс не найден</p>
          <Link href="/courses" className="text-purple-400 hover:underline">
            ← Вернуться к курсам
          </Link>
        </div>
      </div>
    );
  }

  if (isAlreadyPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md bg-green-900/20 border-green-500/30">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Курс уже оплачен!</h2>
            <p className="text-gray-300 mb-4">У вас есть доступ к курсу "{course.title}"</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold transition-all"
            >
              Перейти к обучению
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-background to-purple-500/5">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Назад */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Вернуться к курсам
        </Link>

        {/* Карточка курса */}
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-purple-500/30 mb-6">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{course.icon}</div>
              <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-gray-400">{course.description}</p>
            </div>

            <div className="flex justify-center gap-8 mb-6 text-center">
              <div>
                <p className="text-3xl font-bold text-purple-400">{course.total_lessons}</p>
                <p className="text-sm text-gray-500">уроков</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-400">∞</p>
                <p className="text-sm text-gray-500">доступ</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-400">24/7</p>
                <p className="text-sm text-gray-500">поддержка</p>
              </div>
            </div>

            {/* Цена */}
            <div className="bg-gray-900/50 rounded-xl p-6 mb-6 text-center">
              <p className="text-gray-400 mb-2">Цена курса:</p>
              <p className="text-5xl font-bold text-green-400">${coursePrice}</p>
              <p className="text-sm text-gray-500 mt-2">Одноразовый платёж • Пожизненный доступ</p>
            </div>

            {/* Скидка за рекламу - только для обычных курсов */}
            {discountPrice && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-2 border-orange-500/30">
                <p className="text-orange-400 font-bold text-center mb-3">🎬 Получи скидку за рекламу!</p>
                
                <div className="space-y-2 text-sm text-gray-300 mb-3">
                  <p className="flex items-start gap-2">
                    <span className="text-green-400">1.</span>
                    <span>Скачай наше готовое рекламное видео</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-400">2.</span>
                    <span>Опубликуй его на своём YouTube/TikTok/Instagram</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-400">3.</span>
                    <span>Добавь свой <strong className="text-purple-400">код верификации</strong> в описание видео</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-400">4.</span>
                    <span>Набери <strong className="text-green-400">1000+ просмотров</strong></span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-400">5.</span>
                    <span>Отправь ссылку на видео и получи скидку!</span>
                  </p>
                </div>

                <p className="text-center mb-3">
                  <span className="text-gray-500 line-through">${coursePrice}</span>
                  <span className="text-2xl font-bold text-green-400 ml-2">${discountPrice}</span>
                  <span className="text-sm text-gray-400 ml-2">(экономия $75)</span>
                </p>

                <Link 
                  href="/payment#promo-discount"
                  className="block w-full text-center py-2 px-4 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-400 font-bold transition-all"
                >
                  📥 Получить рекламное видео и код
                </Link>
              </div>
            )}

            {/* Что включено */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-300">
                <Check className="h-5 w-5 text-green-400" />
                <span>Все {course.total_lessons} уроков курса</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Check className="h-5 w-5 text-green-400" />
                <span>Практические задания</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Check className="h-5 w-5 text-green-400" />
                <span>Доступ навсегда</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Check className="h-5 w-5 text-green-400" />
                <span>Техподдержка 24/7</span>
              </div>
            </div>

            {/* Чекбокс согласия */}
            <div className="mb-4 p-4 rounded-xl bg-gray-900/50 border border-gray-700">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-gray-600 bg-gray-800 text-purple-500"
                />
                <span className="text-sm text-gray-300">
                  Я согласен с{' '}
                  <Link href="/terms" target="_blank" className="text-purple-400 hover:underline">
                    условиями использования
                  </Link>
                </span>
              </label>
            </div>

            {/* Кнопка оплаты */}
            <button
              onClick={handlePayment}
              disabled={isProcessing || !agreedToTerms}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-5 px-8 rounded-xl transition-all flex items-center justify-center gap-3 text-xl"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Zap className="h-6 w-6" />
                  Купить курс за ${coursePrice}
                </>
              )}
            </button>

            {!agreedToTerms && (
              <p className="text-xs text-center text-yellow-400 mt-2">
                ⚠️ Примите условия для продолжения
              </p>
            )}
          </CardContent>
        </Card>

        {/* Блок "Все 4 курса" */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50">
          <CardContent className="p-6 text-center">
            <Trophy className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">
              🎓 Хочешь все 4 курса?
            </h3>
            <p className="text-gray-300 mb-4">
              Полный доступ ко всем курсам: Сайты, Приложения, Игры, Платёжные системы — <span className="text-green-400 font-bold">$370</span>
            </p>
            <Link
              href="/payment"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-bold transition-all"
            >
              Купить все 4 курса за $370
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
