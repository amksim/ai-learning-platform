"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Check, Clock, CreditCard, X, Sparkles, Zap, Trophy, Loader2 } from "lucide-react";
import { getTotalLessonsCount } from "@/lib/getLessonsCount";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentPage() {
  const { user, completePurchase } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.hasPaid) {
      router.push("/courses");
      return;
    }
  }, [user, router]);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1SQy9YEUse1J07rXnLjskpwX', // Stripe Price ID for $100 course
          userEmail: user?.email,
        }),
      });

      const data = await response.json();
      
      if (data.sessionId) {
        if (data.mock) {
          // Mock payment - simulate success (for development without Stripe keys)
          setTimeout(() => {
            setPaymentSuccess(true);
            completePurchase('mock_customer_' + Date.now(), 'monthly');
            setTimeout(() => {
              window.location.href = "/payment/success?session_id=" + data.sessionId;
            }, 2000);
          }, 2000);
        } else {
          // Real Stripe payment - redirect to Stripe Checkout
          if (data.url) {
            window.location.href = data.url;
          } else {
            console.error('No checkout URL returned');
            setIsProcessing(false);
          }
        }
      } else {
        console.error('No session ID returned');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
    }
  };

  const discountPrice = 100;
  const originalPrice = 150;
  const totalLessons = getTotalLessonsCount();

  return (
    <div className="min-h-screen py-8 sm:py-10 md:py-12 bg-gradient-to-b from-background to-purple-500/5">
      <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
        

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              {t.payment.title}
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            {t.payment.subtitle}
          </p>
        </div>

        {/* Premium Pricing Card */}
        <div className="flex justify-center mb-12">
          <Card className="glass premium-shadow border-4 border-purple-500/50 relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 max-w-2xl w-full">
            {/* Discount Badge */}
            <div className="absolute top-6 right-6 z-10">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-full font-bold text-2xl shadow-2xl shadow-green-500/50 animate-pulse">
                -33%
              </div>
            </div>
            
            <CardContent className="p-8 sm:p-10 md:p-12 text-center">
              {/* Special Offer Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 border-2 border-orange-500/30 mb-6">
                <Sparkles className="h-5 w-5 text-orange-400" />
                <span className="text-lg font-bold text-orange-400">Специальное предложение</span>
              </div>

              {/* Price Display */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="text-4xl sm:text-5xl text-gray-500 line-through opacity-60">
                    $150
                  </div>
                  <div className="text-6xl sm:text-7xl md:text-8xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent drop-shadow-2xl">
                    $100
                  </div>
                </div>
                <p className="text-xl text-green-400 font-bold">Экономия $50 - Лучшее предложение!</p>
              </div>

              {/* Buy Button */}
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold py-8 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-4 premium-shadow neon-glow text-2xl mb-6"
              >
                <Trophy className="h-8 w-8" />
                Получить полный доступ
                <Trophy className="h-8 w-8" />
              </button>

              {/* Quick Benefits */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-purple-500/30">
                <div>
                  <p className="text-3xl font-bold text-purple-400">{totalLessons}</p>
                  <p className="text-sm text-gray-400">Уроков</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-pink-400">∞</p>
                  <p className="text-sm text-gray-400">Доступ</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-400">24/7</p>
                  <p className="text-sm text-gray-400">Поддержка</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What's Included */}
        <Card className="glass premium-shadow border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t.payment.whats_included}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <Check className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-white">{t.payment.full_course}</p>
                    <p className="text-sm text-gray-400">{t.payment.course_desc}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Check className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-white">{t.payment.any_programs}</p>
                    <p className="text-sm text-gray-400">{t.payment.programs_desc}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Check className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-white">Обучение за 2-3 дня</p>
                    <p className="text-sm text-gray-400">Интенсивная программа</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <Check className="h-6 w-6 text-pink-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-white">Работа с AI</p>
                    <p className="text-sm text-gray-400">Пишешь на русском - AI создаёт код</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <Check className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-white">Пожизненный доступ</p>
                    <p className="text-sm text-gray-400">Оплата один раз, доступ навсегда</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <Check className="h-6 w-6 text-orange-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-white">Поддержка 24/7</p>
                    <p className="text-sm text-gray-400">Отвечаем на все вопросы</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Beautiful Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg">
            <Card className="glass premium-shadow border-2 border-purple-500/50 bg-gradient-to-br from-purple-900/90 to-pink-900/90">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-4 premium-shadow">
                    <Trophy className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {t.payment.great_choice}
                  </h2>
                  <p className="text-gray-300">
                    {t.payment.get_access}
                  </p>
                </div>

                <div className="mb-6 p-6 rounded-2xl bg-gray-900/50 border-2 border-green-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">Обычная цена:</span>
                    <span className="text-2xl text-gray-400 line-through">$150</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-bold">Скидка 33%:</span>
                    <span className="text-2xl text-green-400 font-bold">-$50</span>
                  </div>
                  <div className="border-t border-gray-700 pt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-white">Итого:</span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">$100</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="h-5 w-5 text-green-400" />
                    <span>Пожизненный доступ ко всем урокам</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="h-5 w-5 text-green-400" />
                    <span>Мгновенная активация после оплаты</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="h-5 w-5 text-green-400" />
                    <span>100% безопасная оплата</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 premium-shadow neon-glow text-lg mb-4"
                >
                  <Zap className="h-6 w-6" />
                  Оплатить $100
                </button>

                <p className="text-xs text-center text-gray-400">
                  Нажимая кнопку, ты получишь мгновенный доступ ко всем урокам
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {(isProcessing || paymentSuccess) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-gradient-to-br from-purple-900/90 to-pink-900/90 border-2 border-purple-500/50">
            <CardContent className="p-8 text-center">
              {isProcessing ? (
                <>
                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 border-8 border-purple-500/30 rounded-full"></div>
                      <div className="w-24 h-24 border-8 border-t-purple-500 rounded-full animate-spin absolute top-0"></div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Обработка платежа...
                  </h3>
                  <p className="text-purple-200">
                    Подождите, мы активируем ваш доступ
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-6 flex justify-center">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                      <Check className="h-12 w-12 text-white" strokeWidth={3} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    🎉 Оплата успешна!
                  </h3>
                  <p className="text-green-200 mb-4">
                    Все уроки разблокированы!
                  </p>
                  <p className="text-sm text-purple-200">
                    Перенаправляем на курсы...
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
