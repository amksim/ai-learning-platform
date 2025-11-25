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

type PaymentMethod = 'stripe' | 'yookassa' | 'liqpay';

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
        } else if (country === 'UA') {
          setPaymentMethod('liqpay'); // LiqPay для Украины (добавим позже)
          console.log('🇺🇦 Selected: LiqPay');
        } else {
          setPaymentMethod('stripe'); // Stripe для остальных
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
            amount: 399
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

      // LiqPay для Украины
      if (paymentMethod === 'liqpay') {
        console.log('🇺🇦 Using LiqPay for Ukraine');
        
        const response = await fetch('/api/liqpay/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: user.email,
            amount: 399
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 LiqPay response:', data);
        
        if (data.error) {
          throw new Error(data.error);
        }

        if (data.data && data.signature) {
          console.log('🇺🇦 Redirecting to LiqPay...');
          
          // Создаём форму для отправки на LiqPay
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.checkoutUrl || 'https://www.liqpay.ua/api/3/checkout';
          
          const dataInput = document.createElement('input');
          dataInput.type = 'hidden';
          dataInput.name = 'data';
          dataInput.value = data.data;
          form.appendChild(dataInput);
          
          const signatureInput = document.createElement('input');
          signatureInput.type = 'hidden';
          signatureInput.name = 'signature';
          signatureInput.value = data.signature;
          form.appendChild(signatureInput);
          
          document.body.appendChild(form);
          form.submit();
        } else {
          throw new Error('No payment data received');
        }
        return;
      }

      // Stripe для остального мира
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

        {/* Promo Discount Block */}
        <Card className="glass premium-shadow border-2 border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10 mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Video className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-400">🎬 Скидка за рекламу — $179!</h3>
                <p className="text-gray-300">Экономия $70 от обычной цены</p>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
              <p className="text-gray-300 mb-3"><strong>Как получить скидку:</strong></p>
              <ol className="list-decimal list-inside space-y-2 text-gray-400 text-sm">
                <li>Сними видео-рекламу нашего курса (YouTube, TikTok, Instagram)</li>
                <li>Набери <strong className="text-green-400">1000+ просмотров</strong></li>
                <li>Отправь ссылку на видео нам</li>
                <li>После проверки получи курс за <strong className="text-green-400">$179</strong>!</li>
              </ol>
            </div>

            <button
              onClick={() => setShowPromoModal(true)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <Video className="h-5 w-5" />
              Отправить видео и получить скидку
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
                    <span className="text-2xl text-gray-400 line-through">$599</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-bold">Скидка 33%:</span>
                    <span className="text-2xl text-green-400 font-bold">-$200</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-green-500 to-transparent mb-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xl">Итого:</span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">$370</span>
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

                {/* АДМИНСКАЯ ПАНЕЛЬ - ВЫБОР ЦЕНЫ */}
                {isAdmin && (
                  <div className="mb-4 p-4 rounded-xl bg-yellow-500/10 border-2 border-yellow-500/30">
                    <p className="text-xs text-yellow-400 mb-2 font-bold">🔧 АДМИН РЕЖИМ - ВЫБОР ЦЕНЫ:</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setUseTestPrice(false)}
                        className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                          !useTestPrice 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        $370 (LIVE)
                      </button>
                      <button
                        onClick={() => setUseTestPrice(true)}
                        disabled={!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEST}
                        className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                          useTestPrice 
                            ? 'bg-blue-500 text-white' 
                            : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEST
                              ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                        title={!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEST ? 'Add NEXT_PUBLIC_STRIPE_PRICE_ID_TEST to Netlify env' : ''}
                      >
                        $0.99 (TEST)
                      </button>
                    </div>
                    {!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_TEST && (
                      <p className="text-xs text-red-400 mt-2">
                        ⚠️ Test price not configured. Add NEXT_PUBLIC_STRIPE_PRICE_ID_TEST to Netlify.
                      </p>
                    )}
                  </div>
                )}

                {/* Чекбокс согласия с условиями */}
                <div className="mb-4 p-4 rounded-xl bg-gray-900/50 border border-gray-700">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 h-5 w-5 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">
                      Я прочитал и согласен с{' '}
                      <Link href="/terms" target="_blank" className="text-purple-400 hover:underline">
                        Условиями использования и политикой возврата
                      </Link>
                      . Я понимаю, что возврат возможен только если курс не работает как обещано, 
                      и я обязуюсь пройти минимум 10 уроков перед запросом возврата.
                    </span>
                  </label>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !agreedToTerms}
                  className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3 premium-shadow neon-glow text-lg mb-4"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-6 w-6" />
                      {hasPromoDiscount ? 'Оплатить $300 (со скидкой)' : (useTestPrice ? 'Pay $0.99 (TEST)' : 'Оплатить $370')}
                    </>
                  )}
                </button>

                {!agreedToTerms && (
                  <p className="text-xs text-center text-yellow-400 mb-2">
                    ⚠️ Пожалуйста, примите условия для продолжения
                  </p>
                )}

                <p className="text-xs text-center text-gray-400">
                  Нажмите кнопку для мгновенного доступа ко всем урокам
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Country/Payment Method Selector Modal */}
      {showCountrySelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl">
            <Card className="glass premium-shadow border-2 border-purple-500/50 bg-gradient-to-br from-purple-900/90 to-pink-900/90">
              <button
                onClick={() => setShowCountrySelector(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="h-6 w-6" />
              </button>
              
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    🌍 Выберите способ оплаты
                  </h2>
                  <p className="text-gray-300">
                    Мы автоматически определили ваш регион, но вы можете выбрать другой способ
                  </p>
                </div>

                <div className="grid gap-4 mb-6">
                  {/* Stripe - Весь мир */}
                  <button
                    onClick={() => {
                      setPaymentMethod('stripe');
                      setUserCountry('GB');
                      setShowCountrySelector(false);
                      setShowModal(true);
                    }}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'stripe'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-blue-500/50 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">💳 Банковская карта (Stripe)</h3>
                        <p className="text-sm text-gray-400 mb-2">
                          Для пользователей из Англии, США, Европы и других стран
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs">Visa</span>
                          <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs">Mastercard</span>
                          <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs">American Express</span>
                        </div>
                      </div>
                      {paymentMethod === 'stripe' && (
                        <div className="flex-shrink-0">
                          <Check className="h-6 w-6 text-blue-400" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* YooKassa - Россия */}
                  <button
                    onClick={() => {
                      setPaymentMethod('yookassa');
                      setUserCountry('RU');
                      setShowCountrySelector(false);
                      setShowModal(true);
                    }}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'yookassa'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 hover:border-purple-500/50 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <span className="text-2xl">🇷🇺</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">🚀 СБП + Карты РФ (ЮMoney)</h3>
                        <p className="text-sm text-gray-400 mb-2">
                          Для пользователей из России - СБП, Мир, Visa, Mastercard
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs">СБП</span>
                          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs">Мир</span>
                          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs">Visa РФ</span>
                          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs">MC РФ</span>
                        </div>
                      </div>
                      {paymentMethod === 'yookassa' && (
                        <div className="flex-shrink-0">
                          <Check className="h-6 w-6 text-purple-400" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* LiqPay - Украина */}
                  <button
                    onClick={() => {
                      setPaymentMethod('liqpay');
                      setUserCountry('UA');
                      setShowCountrySelector(false);
                      setShowModal(true);
                    }}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'liqpay'
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-gray-700 hover:border-yellow-500/50 bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <span className="text-2xl">🇺🇦</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">💳 LiqPay (Украина)</h3>
                        <p className="text-sm text-gray-400 mb-2">
                          Для пользователей из Украины - Visa, Mastercard
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 text-xs">Visa</span>
                          <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 text-xs">Mastercard</span>
                          <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 text-xs">Приват24</span>
                        </div>
                      </div>
                      {paymentMethod === 'liqpay' && (
                        <div className="flex-shrink-0">
                          <Check className="h-6 w-6 text-yellow-400" />
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                  <p className="text-xs text-gray-400 text-center">
                    🔒 Все платежи защищены и обрабатываются через надёжные процессоры.<br/>
                    Мы не храним данные вашей карты.
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
              
              <CardContent className="p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-4">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-green-400">
                    🎬 Скидка $70 за рекламу!
                  </h2>
                  <p className="text-gray-300 text-sm">
                    Сними видео о нашем курсе и получи скидку
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
                    ⚠️ Этот код должен быть виден на видео (мелким текстом в углу экрана)
                  </p>
                </div>

                {/* Инструкция */}
                <div className="mb-6 p-4 rounded-xl bg-gray-900/50 border border-gray-700">
                  <p className="text-sm text-gray-300 mb-3 font-medium">📋 Как получить скидку:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                    <li>Сними видео о AI Learning Platform</li>
                    <li><strong className="text-yellow-400">Добавь код в видео</strong> (мелким текстом в углу)</li>
                    <li>Опубликуй на YouTube, TikTok или Instagram</li>
                    <li>Набери минимум <strong className="text-green-400">1000 просмотров</strong></li>
                    <li>Отправь ссылку ниже</li>
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
                  После одобрения цена курса для вас станет <strong className="text-green-400">$179</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
