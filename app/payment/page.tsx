"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Check, Clock, CreditCard, X, Sparkles, Zap, Trophy, Loader2, Video, ExternalLink } from "lucide-react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PaymentMethod = 'stripe' | 'yookassa';

export default function PaymentPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [useTestPrice, setUseTestPrice] = useState(false); // Переключатель для админа
  const [totalLessons, setTotalLessons] = useState(0); // Динамическое количество уроков
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [userCountry, setUserCountry] = useState<string>(''); // Страна пользователя
  const [showCountrySelector, setShowCountrySelector] = useState(false); // Показать выбор страны
  const [agreedToTerms, setAgreedToTerms] = useState(false); // Согласие с условиями
  const [showPromoModal, setShowPromoModal] = useState(false); // Модал скидки за рекламу
  const [promoVideoUrl, setPromoVideoUrl] = useState(''); // Ссылка на видео
  const [promoSubmitting, setPromoSubmitting] = useState(false); // Отправка промо
  const [hasPromoDiscount, setHasPromoDiscount] = useState(false); // Есть ли скидка
  const [verificationCode, setVerificationCode] = useState(''); // Код верификации
  
  // Проверяем является ли пользователь админом
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  // Генерируем стабильный код верификации на основе email
  useEffect(() => {
    if (user?.email) {
      // Создаём хеш из email для стабильного кода
      const emailHash = user.email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const code = 'AIL-' + user.email.slice(0, 2).toUpperCase() + emailHash.toString(36).toUpperCase().slice(0, 4);
      setVerificationCode(code);
    }
  }, [user?.email]);

  // Определяем страну пользователя
  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Пробуем определить по IP через бесплатный API
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const country = data.country_code || '';
        setUserCountry(country);
        
        console.log('🌍 Detected country:', country);
        
        // Автоматически выбираем платёжную систему
        if (country === 'RU') {
          setPaymentMethod('yookassa'); // YooKassa для России
          console.log('🇷🇺 Selected: YooKassa (СБП)');
        } else {
          setPaymentMethod('stripe'); // Stripe для всех остальных (включая Украину)
          console.log('🌍 Selected: Stripe');
        }
      } catch (error) {
        console.error('Failed to detect country:', error);
        // По умолчанию показываем выбор
        setShowCountrySelector(true);
      }
    };
    
    detectCountry();
  }, []);

  // Загружаем количество уроков из API
  useEffect(() => {
    const loadLessonsCount = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        if (data.courses) {
          setTotalLessons(data.courses.length);
        }
      } catch (error) {
        console.error('Failed to load lessons count:', error);
        setTotalLessons(100); // Fallback
      }
    };
    
    loadLessonsCount();
  }, []);

  useEffect(() => {
    // Не проверяем пока загружается
    if (loading) return;
    
    if (!user) {
      router.push("/login");
      return;
    }

    // Админ может видеть страницу оплаты даже если оплатил (для тестирования)
    if (user.hasPaid && !isAdmin) {
      router.push("/courses");
      return;
    }
  }, [user, loading, router, isAdmin]);


  const handlePayment = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);

    try {
      console.log('💳 Starting payment process...');
      console.log('👤 User email:', user?.email || 'No user');
      console.log('💎 Payment method:', paymentMethod);
      
      if (!user?.email) {
        alert('Please login first');
        setIsProcessing(false);
        return;
      }

      // YooKassa для России (СБП)
      if (paymentMethod === 'yookassa') {
        console.log('🇷🇺 Using YooKassa (СБП) for Russia');
        
        const response = await fetch('/api/yookassa/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: user.email,
            productId: 'all', // TODO: добавить выбор курса
            hasDiscount: hasPromoDiscount
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 YooKassa response:', data);
        
        if (data.error) {
          throw new Error(data.error);
        }

        if (data.confirmationUrl) {
          console.log('🇷🇺 Redirecting to YooKassa...');
          window.location.href = data.confirmationUrl;
        } else {
          throw new Error('No payment URL received');
        }
        return;
      }

      // Stripe для всех (включая Украину)
      console.log('🌍 Using Stripe for international payments');
      
      const priceId = useTestPrice 
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEST 
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROD || 'price_1SRGmoIoyNMrDAfMUDpVuB8Y');
      
      console.log('💰 Price mode:', useTestPrice ? 'TEST ($0.99)' : 'PRODUCTION ($370)');
      console.log('💰 Price ID:', priceId);
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 API response:', data);
      
      if (data.error) {
        console.error('❌ API error:', data);
        alert(`Payment error: ${data.error}`);
        setIsProcessing(false);
        return;
      }
      
      if (data.url) {
        console.log('💳 Redirecting to Stripe...');
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      alert(`Payment failed: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const discountPrice = 100;
  const originalPrice = 150;

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Don't render if no user
  if (!user) {
    return null;
  }

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
                <span className="text-lg font-bold text-orange-400">🌍 Единственный в мире курс</span>
              </div>

              {/* Price Display */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-6 mb-4">
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400 mb-2">
                  Все 4 курса 🎉
                </p>  
                  <div className="text-6xl sm:text-7xl md:text-8xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent drop-shadow-2xl">
                    $370
                  </div>
                </div>
                <p className="text-xl text-green-400 font-bold">Полный доступ ко всем курсам!</p>
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

        {/* Promo Discount Block - Simplified */}
        <Card className="glass premium-shadow border-2 border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10 mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <Video className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">🎬 Получи скидку $75!</h3>
              <p className="text-gray-300">Опубликуй наше видео и плати меньше</p>
              <div className="mt-3 flex items-center justify-center gap-4">
                <span className="text-gray-500 line-through text-xl">$370</span>
                <span className="text-3xl font-bold text-green-400">$295</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">📥</div>
                <p className="font-bold text-white text-sm">1. Скачай видео</p>
                <p className="text-xs text-gray-400">Готовые ролики для TikTok/YouTube</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">📤</div>
                <p className="font-bold text-white text-sm">2. Опубликуй</p>
                <p className="text-xs text-gray-400">На свой YouTube, TikTok или Instagram</p>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">🎉</div>
                <p className="font-bold text-white text-sm">3. Получи скидку</p>
                <p className="text-xs text-gray-400">Отправь ссылку — получи $75 скидки</p>
              </div>
            </div>

            <button
              onClick={() => setShowPromoModal(true)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <Video className="h-5 w-5" />
              Получить скидку $75
            </button>
          </CardContent>
        </Card>

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

      {/* Beautiful Payment Modal with Payment Method Selection */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8">
            <Card className="glass premium-shadow border-2 border-purple-500/50 bg-gradient-to-br from-gray-900 to-purple-900/50">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="h-6 w-6" />
              </button>
              
              <CardContent className="p-6 sm:p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2 text-white">
                    💳 Выберите способ оплаты
                  </h2>
                  <p className="text-gray-400">
                    Безопасная оплата через проверенные системы
                  </p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4 mb-8">
                  {/* Stripe - Весь мир включая Украину */}
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
                      paymentMethod === 'stripe'
                        ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20'
                        : 'border-gray-700 hover:border-blue-500/50 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">Банковская карта</h3>
                          {paymentMethod === 'stripe' && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs font-bold">Выбрано</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          🇺🇦 Украина • 🇬🇧 Англия • 🇺🇸 США • 🇪🇺 Европа • Весь мир
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 rounded-lg bg-white/10 text-gray-300 text-xs">Visa</span>
                          <span className="px-2 py-1 rounded-lg bg-white/10 text-gray-300 text-xs">Mastercard</span>
                          <span className="px-2 py-1 rounded-lg bg-white/10 text-gray-300 text-xs">Apple Pay</span>
                          <span className="px-2 py-1 rounded-lg bg-white/10 text-gray-300 text-xs">Google Pay</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-500' : 'border-gray-600'
                      }`}>
                        {paymentMethod === 'stripe' && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                  </button>

                  {/* YooKassa - Россия */}
                  <button
                    onClick={() => setPaymentMethod('yookassa')}
                    className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${
                      paymentMethod === 'yookassa'
                        ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                        : 'border-gray-700 hover:border-purple-500/50 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🇷🇺</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">Россия (ЮMoney)</h3>
                          {paymentMethod === 'yookassa' && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs font-bold">Выбрано</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          Для пользователей из России
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 rounded-lg bg-white/10 text-gray-300 text-xs">СБП</span>
                          <span className="px-2 py-1 rounded-lg bg-white/10 text-gray-300 text-xs">Мир</span>
                          <span className="px-2 py-1 rounded-lg bg-white/10 text-gray-300 text-xs">Visa РФ</span>
                          <span className="px-2 py-1 rounded-lg bg-white/10 text-gray-300 text-xs">Mastercard РФ</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'yookassa' ? 'border-purple-500 bg-purple-500' : 'border-gray-600'
                      }`}>
                        {paymentMethod === 'yookassa' && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Price Summary */}
                <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Полный доступ ко всем 4 курсам</p>
                      <p className="text-white font-bold text-lg">Пожизненный доступ</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 line-through text-sm">$599</p>
                      <p className="text-3xl font-bold text-green-400">$370</p>
                    </div>
                  </div>
                </div>

                {/* АДМИНСКАЯ ПАНЕЛЬ */}
                {isAdmin && (
                  <div className="mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                    <p className="text-xs text-yellow-400 mb-2 font-bold">🔧 АДМИН:</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setUseTestPrice(false)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold ${!useTestPrice ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                      >
                        LIVE
                      </button>
                      <button
                        onClick={() => setUseTestPrice(true)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold ${useTestPrice ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                      >
                        TEST $0.99
                      </button>
                    </div>
                  </div>
                )}

                {/* Terms Checkbox */}
                <div className="mb-6 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-300">
                      Согласен с{' '}
                      <Link href="/terms" target="_blank" className="text-purple-400 hover:underline">
                        условиями использования
                      </Link>
                    </span>
                  </label>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !agreedToTerms}
                  className={`w-full font-bold py-5 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg ${
                    !agreedToTerms 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : paymentMethod === 'stripe'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transform hover:scale-105'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Zap className="h-6 w-6" />
                      {paymentMethod === 'stripe' ? 'Оплатить картой' : 'Оплатить через СБП/карту'}
                    </>
                  )}
                </button>

                {!agreedToTerms && (
                  <p className="text-xs text-center text-yellow-400 mt-3">
                    ⚠️ Примите условия для продолжения
                  </p>
                )}

                {/* Security Badge */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <p className="text-xs text-center text-gray-500">
                    🔒 Безопасная оплата • Данные карты не хранятся • Мгновенный доступ
                  </p>
                </div>
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

      {/* Promo Video Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg my-8">
            <Card className="glass premium-shadow border-2 border-green-500/50 bg-gradient-to-br from-green-900/90 to-emerald-900/90">
              <button
                onClick={() => setShowPromoModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="h-6 w-6" />
              </button>
              
              <CardContent className="p-6 sm:p-8" id="promo-discount">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-4">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-green-400">
                    🎬 Скидка $75 за рекламу!
                  </h2>
                  <p className="text-gray-300 text-sm">
                    Опубликуй наше видео — получи скидку
                  </p>
                  <p className="text-center mt-2">
                    <span className="text-gray-500 line-through">$370</span>
                    <span className="text-2xl font-bold text-green-400 ml-2">$295</span>
                  </p>
                </div>

                {/* Готовые рекламные видео */}
                <div className="mb-6 p-4 rounded-xl bg-blue-500/20 border-2 border-blue-500/50">
                  <p className="text-sm text-blue-300 mb-3 font-medium">📥 Скачай готовое рекламное видео:</p>
                  <div className="space-y-2">
                    <a 
                      href="https://ai-learning45.netlify.app/promo/video1.mp4" 
                      target="_blank"
                      className="block py-2 px-4 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-sm transition-all"
                    >
                      🎬 Видео 1 - Короткое (30 сек) для TikTok/Reels
                    </a>
                    <a 
                      href="https://ai-learning45.netlify.app/promo/video2.mp4" 
                      target="_blank"
                      className="block py-2 px-4 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-sm transition-all"
                    >
                      🎬 Видео 2 - Длинное (2 мин) для YouTube
                    </a>
                  </div>
                  <p className="text-xs text-blue-400 mt-2">
                    Скоро добавим больше видео!
                  </p>
                </div>

                {/* Уникальный код верификации */}
                <div className="mb-6 p-4 rounded-xl bg-purple-500/20 border-2 border-purple-500/50">
                  <p className="text-sm text-purple-300 mb-2 font-medium">🔑 Твой уникальный код верификации:</p>
                  <div className="bg-gray-900 rounded-lg p-3 text-center">
                    <code className="text-2xl font-mono font-bold text-yellow-400 tracking-wider select-all">
                      {verificationCode || 'Загрузка...'}
                    </code>
                  </div>
                  <p className="text-xs text-purple-400 mt-2">
                    ⚠️ Добавь этот код в <strong>описание видео</strong> или в <strong>комментарий</strong> под видео
                  </p>
                </div>

                {/* Инструкция */}
                <div className="mb-6 p-4 rounded-xl bg-gray-900/50 border border-gray-700">
                  <p className="text-sm text-gray-300 mb-3 font-medium">📋 3 простых шага:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                    <li><strong className="text-blue-400">Скачай</strong> готовое видео выше</li>
                    <li><strong className="text-blue-400">Опубликуй</strong> на YouTube, TikTok или Instagram</li>
                    <li><strong className="text-green-400">Отправь ссылку</strong> и получи скидку!</li>
                  </ol>
                </div>

                {/* Форма отправки */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ссылка на видео:
                  </label>
                  <input
                    type="url"
                    value={promoVideoUrl}
                    onChange={(e) => setPromoVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                </div>

                <button
                  onClick={async () => {
                    if (!promoVideoUrl || !user?.email || !verificationCode) return;
                    
                    setPromoSubmitting(true);
                    try {
                      const response = await fetch('/api/promo-video', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userEmail: user.email,
                          videoUrl: promoVideoUrl,
                          verificationCode: verificationCode
                        })
                      });
                      
                      if (response.ok) {
                        alert(`✅ Заявка отправлена!\n\n🔑 Ваш код: ${verificationCode}\n\n⚠️ Убедитесь, что код виден на видео!\n\nМы проверим в течение 48 часов.`);
                        setShowPromoModal(false);
                        setPromoVideoUrl('');
                      } else {
                        alert('❌ Ошибка при отправке. Попробуйте позже.');
                      }
                    } catch (error) {
                      alert('❌ Ошибка при отправке. Попробуйте позже.');
                    }
                    setPromoSubmitting(false);
                  }}
                  disabled={promoSubmitting || !promoVideoUrl}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3"
                >
                  {promoSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Отправить на проверку
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-400 mt-4">
                  После проверки вы получите скидку <strong className="text-green-400">$75</strong> — итого <strong className="text-green-400">$295</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
