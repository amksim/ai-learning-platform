"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Star, ArrowRight, Code, Smartphone, Gamepad2, Target, Zap, Users, TrendingUp, Gift, User, Trophy } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import ReferralCodeHandler from "@/components/ReferralCodeHandler";

export default function HomePage() {
  const { t } = useLanguage();
  const { reviews } = useReviews();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, activeStudents: 0 });
  const [baseActiveStudents, setBaseActiveStudents] = useState(0);

  // Загрузка статистики
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setBaseActiveStudents(data.activeStudents);
      })
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

  // Динамическое изменение "Учатся сейчас" - варьируется около половины от totalUsers
  useEffect(() => {
    if (!stats.totalUsers || !baseActiveStudents) return;

    const interval = setInterval(() => {
      setStats(prev => {
        // Плавное изменение на ±1-5 человек от текущего значения
        const change = Math.floor(Math.random() * 11) - 5; // от -5 до +5
        let newValue = prev.activeStudents + change;
        
        // Ограничиваем диапазон 40-60% от totalUsers
        const min = Math.floor(stats.totalUsers * 0.4);
        const max = Math.floor(stats.totalUsers * 0.6);
        newValue = Math.max(min, Math.min(max, newValue));
        
        return {
          ...prev,
          activeStudents: newValue
        };
      });
    }, 600000); // Меняем каждые 10 минут

    return () => clearInterval(interval);
  }, [stats.totalUsers, baseActiveStudents]);

  const tracks = [
    {
      icon: Code,
      title: t.home.track_websites,
      description: t.home.track_websites_desc,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Smartphone,
      title: t.home.track_apps,
      description: t.home.track_apps_desc,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Gamepad2,
      title: t.home.track_games,
      description: t.home.track_games_desc,
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const features = [
    {
      icon: Target,
      title: t.home.feature_1_title,
      description: t.home.feature_1_desc,
    },
    {
      icon: Code,
      title: t.home.feature_2_title,
      description: t.home.feature_2_desc,
    },
    {
      icon: Zap,
      title: t.home.feature_3_title,
      description: t.home.feature_3_desc,
    },
    {
      icon: Gift,
      title: t.home.feature_4_title,
      description: t.home.feature_4_desc,
    },
  ];

  // Показываем 6 или все отзывы в зависимости от состояния
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 6);

  const studentProjects = [
    {
      title: "Интернет-магазин одежды",
      author: "Максим К.",
      description: "Стильный магазин с фильтрами и оплатой онлайн",
      image: "👕",
      url: "https://elegant-clothing-shop.vercel.app",
      category: "website"
    },
    {
      title: "Трекер привычек",
      author: "Мария Л.",
      description: "Приложение для отслеживания ежедневных привычек с напоминаниями",
      image: "✓",
      url: "https://habit-tracker-app-demo.vercel.app",
      category: "app"
    },
    {
      title: "Тетрис",
      author: "Дмитрий В.",
      description: "Классическая игра с уровнями сложности",
      image: "🎮",
      url: "https://js-tetris-game.netlify.app",
      category: "game"
    },
    {
      title: "Калькулятор калорий",
      author: "Анна С.",
      description: "Удобный счётчик калорий для здорового питания",
      image: "🥗",
      url: "https://calorie-calculator-modern.vercel.app",
      category: "app"
    },
    {
      title: "Змейка 2.0",
      author: "Владислав Ч.",
      description: "Обновлённая версия классической игры с бонусами",
      image: "🐍",
      url: "https://snake-game-js-modern.netlify.app",
      category: "game"
    },
    {
      title: "Портфолио дизайнера",
      author: "София М.",
      description: "Минималистичное портфолио с анимациями",
      image: "🎨",
      url: "https://designer-portfolio-minimal.vercel.app",
      category: "website"
    },
    {
      title: "Таймер Помодоро",
      author: "Игорь П.",
      description: "Продуктивность по методу помодоро с статистикой",
      image: "⏱",
      url: "https://pomodoro-timer-app.netlify.app",
      category: "app"
    },
    {
      title: "Сайт ресторана",
      author: "Елена Д.",
      description: "Красивый сайт с меню и бронированием столиков",
      image: "🍽",
      url: "https://restaurant-website-template.vercel.app",
      category: "website"
    },
    {
      title: "Крестики-нолики",
      author: "Артём Б.",
      description: "Игра с AI противником и онлайн режимом",
      image: "❌",
      url: "https://tic-tac-toe-ai-game.netlify.app",
      category: "game"
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-32">
        {/* Анимированный фоновый градиент */}
        <div className="absolute inset-0 ai-gradient opacity-10" />
        
        {/* Бейдж "Первая платформа" - слева по центру */}
        <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-20 animate-float">
          <div className="glass premium-shadow neon-glow rounded-2xl p-8 border-2 border-orange-400/60 backdrop-blur-xl w-[240px] hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-orange-600/30 via-amber-600/30 to-yellow-600/30">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 neon-glow shadow-2xl">
                <Trophy className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
              <div className="text-center">
                <p className="text-base leading-tight text-orange-300 font-extrabold mb-3 tracking-wider drop-shadow-lg">
                  🌍 ПЕРВАЯ В МИРЕ
                </p>
                <p className="text-base leading-snug text-gray-100 font-bold">
                  Единственный курс для создания сайтов, игр и приложений с AI без кода
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Виджет статистики - справа по центру */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-20 animate-float-delayed">
          <div className="glass premium-shadow neon-glow rounded-2xl p-6 border-2 border-purple-500/50 backdrop-blur-xl hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 neon-glow">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-purple-400 tracking-wide">📊 Статистика</h3>
            </div>
            
            {/* Всего пользователей */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-400" />
                <p className="text-xs text-gray-300 font-medium">Пользователей</p>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {stats.totalUsers}
              </p>
            </div>
            
            {/* Активных учеников */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                  <User className="h-4 w-4 text-green-400" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                </div>
                <p className="text-xs text-gray-300 font-medium">Учатся сейчас</p>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent transition-all duration-500">
                {stats.activeStudents}
              </p>
              <p className="text-[9px] text-gray-500 mt-2 opacity-70">
                ⏱️ Обновление каждые 10 минут
              </p>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full glass premium-shadow px-6 py-3 text-sm font-medium border-2 border-purple-500/30">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 animate-pulse" />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent font-bold">
                {t.home.badge_text}
              </span>
            </div>
            
            <h1 className="mb-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {t.home.hero_title}
            </h1>
            
            <p className="mb-10 max-w-2xl text-lg text-gray-300 md:text-xl leading-relaxed">
              {t.home.hero_subtitle}
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/courses">
                <Button size="lg" className="gap-2 premium-shadow neon-glow bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-6 text-lg">
                  {t.home.cta_start}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button variant="outline" size="lg" className="glass px-8 py-6 text-lg border-2 border-purple-200 hover:border-purple-400">
                  {t.home.cta_learn}
                </Button>
              </Link>
            </div>

            {/* Мобильная версия бейджа "Первая платформа" */}
            <div className="lg:hidden mt-6 flex justify-center">
              <div className="glass premium-shadow neon-glow rounded-xl p-6 border-2 border-orange-400/60 max-w-[320px] bg-gradient-to-br from-orange-600/30 via-amber-600/30 to-yellow-600/30">
                <div className="flex flex-col gap-3 items-center text-center">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 neon-glow shadow-lg">
                    <Trophy className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                  <div>
                    <p className="text-sm leading-tight text-orange-300 font-extrabold mb-2 tracking-wider drop-shadow-lg">🌍 ПЕРВАЯ В МИРЕ</p>
                    <p className="text-sm leading-snug text-gray-100 font-bold">
                      Единственный курс для создания сайтов, игр и приложений с AI без кода
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Мобильная версия виджета статистики */}
            <div className="lg:hidden mt-4 flex gap-4 justify-center">
              <div className="glass premium-shadow rounded-xl p-4 border-2 border-blue-500/30 min-w-[140px]">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <p className="text-xs text-gray-400">Пользователей</p>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="glass premium-shadow rounded-xl p-4 border-2 border-green-500/30 min-w-[140px]">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-green-400" />
                  <p className="text-xs text-gray-400">Учатся сейчас</p>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {stats.activeStudents}
                </p>
                <p className="text-[8px] text-gray-500 mt-1.5 opacity-70">
                  ⏱️ Обновление каждые 10 мин
                </p>
              </div>
            </div>
            <p className="lg:hidden text-[9px] text-gray-500 text-center mt-2 opacity-70">
              ⏱️ Обновление каждые 10 минут
            </p>
          </div>
        </div>

        {/* Animated premium background effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 blur-3xl animate-pulse" />
          <div className="absolute right-1/4 top-40 h-96 w-96 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute left-1/3 bottom-20 h-64 w-64 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 opacity-15 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-12 md:py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            {t.home.tracks_title}
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            {t.home.hero_subtitle}
          </p>
          
          <div className="grid grid-cols-2 gap-4 md:gap-8 md:grid-cols-3">
            {tracks.map((track) => {
              const Icon = track.icon;
              return (
                <Card key={track.title} className="group h-full glass premium-shadow hover:scale-105 transition-all duration-300 border-2 hover:border-purple-300">
                  <CardHeader className="p-3 sm:p-4 md:p-6">
                    <div className={`mb-3 inline-flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br ${track.gradient} shadow-2xl neon-glow group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <CardTitle className="text-base sm:text-xl md:text-2xl group-hover:text-purple-600 transition-colors">{track.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm md:text-base">{track.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-purple-600">
                      ✓ Включено в курс
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/courses">
              <Button size="lg" className="gap-2">
                {t.buttons.start_learning}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-accent/50 py-12 md:py-20 lg:py-32 overflow-hidden">
        {/* Фоновый градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-pink-900/10 to-blue-900/10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                {t.home.features_title}
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Научись программировать как профи без знания кода — с помощью AI
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title} 
                  className="group flex flex-col items-center text-center p-6 rounded-2xl glass premium-shadow border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl neon-glow group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <h3 className="mb-3 text-base sm:text-lg md:text-xl font-bold group-hover:text-purple-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            {t.home.testimonials_title}
          </h2>
          <p className="mb-12 text-center text-gray-400 max-w-2xl mx-auto">
            {t.reviews.subtitle}
          </p>
          
          <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedReviews.map((review) => (
              <Card key={review.id} className="h-full glass premium-shadow neon-glow border-2 border-purple-500/30 hover:border-purple-400 transition-all hover:scale-[1.02] backdrop-blur-xl bg-gradient-to-br from-purple-900/10 via-pink-900/10 to-blue-900/10 relative overflow-hidden">
                {/* Декоративная иконка цитаты */}
                <div className="absolute top-4 right-4 text-6xl text-purple-500/10 font-serif leading-none">"</div>
                
                <CardHeader className="p-4 sm:p-5 md:p-6 relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <CardTitle className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                      {review.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 md:p-6 pt-0 relative z-10">
                  <p className="text-sm sm:text-base text-gray-200 leading-relaxed italic">
                    {review.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {!showAllReviews && reviews.length > 6 && (
            <div className="mt-12 text-center">
              <Button 
                onClick={() => setShowAllReviews(true)}
                size="lg"
                variant="outline"
                className="gap-2 glass border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all premium-shadow"
              >
                {t.reviews.show_all_reviews.replace('{count}', reviews.length.toString())}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          )}
          
          {showAllReviews && (
            <div className="mt-12 text-center">
              <Button 
                onClick={() => setShowAllReviews(false)}
                size="lg"
                variant="outline"
                className="gap-2 glass border-2 border-purple-300 hover:border-purple-500"
              >
                {t.reviews.hide_reviews}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Student Projects Section */}
      <section className="relative py-12 md:py-20 lg:py-32 overflow-hidden">
        {/* Фоновый градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20" />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Премиум заголовок */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-2 border-purple-200 mb-4">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">Портфолио студентов</span>
            </div>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Проекты наших учеников
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Вдохновляйся работами других учеников и делись своими проектами
            </p>
          </div>
          
          {/* Премиум карточки проектов */}
          <div className="grid grid-cols-2 gap-4 md:gap-8 md:grid-cols-3">
            {studentProjects.map((project, index) => (
              <a 
                key={project.title}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card 
                  className="group h-full glass premium-shadow border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer"
                >
                {/* Большой эмодзи с градиентным фоном */}
                <div className="relative h-32 sm:h-40 md:h-48 flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 group-hover:from-purple-200 group-hover:via-pink-200 group-hover:to-blue-200 transition-all">
                  <div className="text-5xl sm:text-6xl md:text-8xl transform group-hover:scale-110 transition-transform duration-300">
                    {project.image}
                  </div>
                  {/* Бейдж категории */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs font-semibold text-purple-600 shadow-lg">
                    {project.category === 'website' ? '🌐 Сайты' : project.category === 'app' ? '📱 Приложения' : '🎮 Игры'}
                  </div>
                </div>
                
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <CardTitle className="text-sm sm:text-base md:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {project.title}
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">{project.author}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{project.description}</p>
                </CardHeader>
                
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all"
                  >
                    {t.home.view_project}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
              </a>
            ))}
          </div>
          
          {/* Кнопка "Смотреть все" */}
          <div className="mt-16 text-center">
            <Link href="/projects">
              <Button 
                size="lg" 
                className="glass px-8 py-6 text-lg border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all premium-shadow"
                variant="outline"
              >
                Смотреть все проекты
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-purple-500 glass premium-shadow neon-glow overflow-hidden relative">
            {/* Фоновый градиент */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-blue-900/30" />
            
            <CardContent className="flex flex-col items-center gap-6 p-6 sm:p-8 md:p-12 text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border-2 border-purple-300 mb-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-600">Начни прямо сейчас</span>
              </div>
              
              <h2 className="text-4xl font-bold md:text-5xl">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Стань разработчиком!
                </span>
              </h2>
              
              <p className="max-w-2xl text-lg text-gray-300 font-medium">
                🌍 Единственный в мире курс! Создавай с AI без знания кода. 
                Сайты, игры, приложения - всё в одном курсе за $399!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/courses">
                  <Button size="lg" className="gap-2 premium-shadow neon-glow bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-8 py-6 text-lg">
                    {t.buttons.start_learning}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" variant="outline" className="glass px-8 py-6 text-lg border-2 border-purple-300 hover:border-purple-500">
                    {t.buttons.view_all_projects}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Обработчик реферального кода */}
      <Suspense fallback={null}>
        <ReferralCodeHandler />
      </Suspense>
    </div>
  );
}
