"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Trophy, Target, ArrowRight, Star, Send, Award, Zap, TrendingUp, CheckCircle, Flame, Book, Edit2, Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function ProfilePageContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const { addReview, hasUserReviewed } = useReviews();
  
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [totalLevels, setTotalLevels] = useState(100); // По умолчанию 100, обновится из API
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingTelegram, setIsEditingTelegram] = useState(false);
  const [telegramInput, setTelegramInput] = useState(user?.telegram_username || "");

  // Загружаем реальное количество уроков из API
  useEffect(() => {
    const loadTotalLessons = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        if (data.courses && data.courses.length > 0) {
          setTotalLevels(data.courses.length);
          console.log(`📚 Загружено ${data.courses.length} уроков из базы`);
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки количества уроков:', error);
        // Оставляем дефолтное значение 100
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTotalLessons();
  }, []);

  // Removed redirect - causes issues when resetting payment status
  // User check is handled in Navigation component

  if (!user) {
    return null;
  }

  const completedLevels = user.completedLessons?.length || user.progress || 0;
  const remainingLevels = Math.max(0, totalLevels - completedLevels);
  const progressPercent = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;
  
  // Генерируем достижения каждые 10 уроков
  const generateAchievements = () => {
    const achievements = [];
    const maxAchievements = Math.ceil(totalLevels / 10); // Достижения каждые 10 уроков
    
    for (let i = 1; i <= maxAchievements; i++) {
      const milestone = i * 10;
      const isUnlocked = completedLevels >= milestone;
      
      achievements.push({
        id: i,
        milestone,
        name: milestone === 10 ? 'Разгон' : milestone === 20 ? 'Продвинутый' : milestone === 30 ? 'Профи' : milestone === 50 ? 'Эксперт' : milestone === 100 ? 'Мастер' : `Уровень ${milestone}`,
        icon: milestone === 10 ? Zap : milestone === 20 ? TrendingUp : milestone === 30 ? Star : milestone === 50 ? Award : milestone === 100 ? Trophy : Target,
        color: milestone === 10 ? 'blue' : milestone === 20 ? 'green' : milestone === 30 ? 'purple' : milestone === 50 ? 'pink' : milestone === 100 ? 'yellow' : 'cyan',
        isUnlocked
      });
    }
    
    return achievements;
  };
  
  const achievements = generateAchievements();
  
  const hasCompletedAll = completedLevels >= totalLevels;
  const alreadyReviewed = hasUserReviewed(user.email);
  
  const handleSubmitReview = () => {
    if (reviewText.trim().length < 20) {
      alert("Отзыв должен содержать минимум 20 символов");
      return;
    }
    
    addReview({
      name: user.full_name || user.email.split('@')[0],
      email: user.email,
      text: reviewText.trim(),
      rating: reviewRating,
    });
    
    setReviewSubmitted(true);
    setShowReviewForm(false);
    setReviewText("");
  };
  
  // Дата регистрации
  const joinedDate = user.joinedDate ? new Date(user.joinedDate) : new Date();
  const formattedDate = joinedDate.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  
  // Сколько дней прошло
  const daysLearning = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-gradient-to-b from-background to-purple-500/5">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Hero Header */}
        <div className="mb-8 text-center">
          {/* Avatar */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 mb-4 text-4xl font-bold text-white premium-shadow neon-glow">
            {(user.full_name || user.email)[0].toUpperCase()}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              {user.full_name || user.email.split('@')[0]}
            </span>
          </h1>
          <p className="text-gray-400">{user.email}</p>
          
          {/* Telegram Username */}
          <div className="mt-2 flex items-center justify-center gap-2">
            {!isEditingTelegram ? (
              <>
                {user.telegram_username ? (
                  <p className="text-purple-400 flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    @{user.telegram_username}
                    <button
                      onClick={() => {
                        setIsEditingTelegram(true);
                        setTelegramInput(user.telegram_username || "");
                      }}
                      className="text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </p>
                ) : (
                  <button
                    onClick={() => setIsEditingTelegram(true)}
                    className="text-sm text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1"
                  >
                    <Send className="h-3 w-3" />
                    Добавить Telegram
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-purple-400">@</span>
                <input
                  type="text"
                  value={telegramInput}
                  onChange={(e) => setTelegramInput(e.target.value.replace('@', ''))}
                  placeholder="username"
                  className="w-32 px-2 py-1 text-sm rounded border border-purple-500/30 bg-gray-900/50 text-white focus:outline-none focus:border-purple-500"
                  autoFocus
                />
                <button
                  onClick={async () => {
                    try {
                      await updateProfile({ telegram_username: telegramInput || undefined });
                      setIsEditingTelegram(false);
                    } catch (error) {
                      console.error('Error updating telegram:', error);
                      alert('Ошибка обновления Telegram');
                    }
                  }}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditingTelegram(false);
                    setTelegramInput(user.telegram_username || "");
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          
          {/* Status Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30">
            <Trophy className="h-5 w-5 text-purple-400" />
            <span className="font-bold text-purple-400">
              {completedLevels === 0 && 'Новичок 🌱'}
              {completedLevels >= 1 && completedLevels < Math.floor(totalLevels * 0.25) && 'Ученик 📚'}
              {completedLevels >= Math.floor(totalLevels * 0.25) && completedLevels < Math.floor(totalLevels * 0.75) && 'Разработчик 💻'}
              {completedLevels >= Math.floor(totalLevels * 0.75) && completedLevels < totalLevels && 'Эксперт 🚀'}
              {completedLevels >= totalLevels && 'Мастер 👑'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Progress */}
          <Card className="glass border-2 border-purple-500/20 hover:border-purple-500/40 transition-all premium-shadow">
            <CardContent className="p-4 sm:p-5 md:p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Book className="h-6 w-6 text-purple-400" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                {completedLevels}
              </div>
              <div className="text-xs text-gray-400">{t.profile.lessons_completed}</div>
            </CardContent>
          </Card>

          {/* Progress Percent */}
          <Card className="glass border-2 border-blue-500/20 hover:border-blue-500/40 transition-all premium-shadow">
            <CardContent className="p-4 sm:p-5 md:p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                {progressPercent}%
              </div>
              <div className="text-xs text-gray-400">{t.profile.progress_percent}</div>
            </CardContent>
          </Card>

          {/* Days Learning */}
          <Card className="glass border-2 border-orange-500/20 hover:border-orange-500/40 transition-all premium-shadow">
            <CardContent className="p-4 sm:p-5 md:p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20">
                <Flame className="h-6 w-6 text-orange-400" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-1">
                {daysLearning}
              </div>
              <div className="text-xs text-gray-400">{t.profile.days_learning}</div>
            </CardContent>
          </Card>

          {/* Remaining */}
          <Card className="glass border-2 border-green-500/20 hover:border-green-500/40 transition-all premium-shadow">
            <CardContent className="p-4 sm:p-5 md:p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <Target className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                {remainingLevels}
              </div>
              <div className="text-xs text-gray-400">{t.profile.remaining}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Progress Card */}
        <Card className="mb-8 glass border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 premium-shadow">
          <CardContent className="p-5 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t.profile.your_progress}
              </h2>
              <div className="text-4xl font-bold text-white">
                {completedLevels} <span className="text-gray-500">/ {totalLevels}</span>
              </div>
            </div>
            
            {/* Giant Progress Bar */}
            <div className="relative h-8 overflow-hidden rounded-full bg-gray-800 border-2 border-purple-500/20">
              <div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 transition-all duration-1000 neon-glow"
                style={{ width: `${progressPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white drop-shadow-lg z-10">
                  {progressPercent}%
                </span>
              </div>
            </div>
            
            {remainingLevels > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-gray-300">
                  Продолжай! Осталось <span className="font-bold text-white">{remainingLevels}</span> уроков до завершения
                </p>
                <Link href="/courses">
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all premium-shadow">
                    {t.common.continue}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements / Badges - Horizontal Scroll */}
        <Card className="mb-8 glass border-2 border-purple-500/20 premium-shadow">
          <CardContent className="p-5 sm:p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              {t.profile.achievements}
            </h2>
            
            {/* Горизонтальный скролл достижений */}
            <div className="overflow-x-auto pb-4 -mx-2">
              <div className="flex gap-3 px-2 min-w-max">
                {/* Первый урок */}
                <div className={`flex-shrink-0 w-24 p-2 rounded-lg border text-center transition-all ${
                  completedLevels >= 1 
                    ? 'border-green-500/30 bg-green-500/10' 
                    : 'border-gray-700 bg-gray-800/50 opacity-50'
                }`}>
                  <div className={`w-10 h-10 mx-auto mb-1.5 rounded-full flex items-center justify-center ${
                    completedLevels >= 1 
                      ? 'bg-green-500/20' 
                      : 'bg-gray-700'
                  }`}>
                    <CheckCircle className={`h-5 w-5 ${
                      completedLevels >= 1 ? 'text-green-400' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="text-xs font-bold mb-0.5">Старт</div>
                  <div className="text-[10px] text-gray-400">1 урок</div>
                </div>
                
                {/* Динамические достижения каждые 10 уроков */}
                {achievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  const colors = {
                    blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', iconBg: 'bg-blue-500/20', text: 'text-blue-400' },
                    green: { border: 'border-green-500/30', bg: 'bg-green-500/10', iconBg: 'bg-green-500/20', text: 'text-green-400' },
                    purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', iconBg: 'bg-purple-500/20', text: 'text-purple-400' },
                    pink: { border: 'border-pink-500/30', bg: 'bg-pink-500/10', iconBg: 'bg-pink-500/20', text: 'text-pink-400' },
                    yellow: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', iconBg: 'bg-yellow-500/20', text: 'text-yellow-400' },
                    cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', iconBg: 'bg-cyan-500/20', text: 'text-cyan-400' },
                  };
                  const color = colors[achievement.color as keyof typeof colors];
                  
                  return (
                    <div key={achievement.id} className={`flex-shrink-0 w-24 p-2 rounded-lg border text-center transition-all ${
                      achievement.isUnlocked 
                        ? `${color.border} ${color.bg}` 
                        : 'border-gray-700 bg-gray-800/50 opacity-50'
                    }`}>
                      <div className={`w-10 h-10 mx-auto mb-1.5 rounded-full flex items-center justify-center ${
                        achievement.isUnlocked 
                          ? color.iconBg 
                          : 'bg-gray-700'
                      }`}>
                        <IconComponent className={`h-5 w-5 ${
                          achievement.isUnlocked ? color.text : 'text-gray-500'
                        }`} />
                      </div>
                      <div className="text-xs font-bold mb-0.5 truncate">{achievement.name}</div>
                      <div className="text-[10px] text-gray-400">{achievement.milestone} уроков</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Goal */}
        {remainingLevels > 0 && (
          <Card className="mb-8 glass border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5 premium-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <Target className="h-8 w-8 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{t.profile.next_goal}</p>
                    <p className="text-2xl font-bold text-white">{t.courses.lesson} {completedLevels + 1}</p>
                    <p className="text-sm text-gray-400 mt-1">{t.profile.joined}: {formattedDate}</p>
                  </div>
                </div>
                <Link href="/courses">
                  <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all premium-shadow text-lg">
                    {t.common.start}
                    <ArrowRight className="h-6 w-6" />
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Всё завершено! */}
        {hasCompletedAll && (
          <>
            <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 glass premium-shadow">
              <CardContent className="p-8 text-center">
                <Trophy className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Поздравляем! 🎉</h2>
                <p className="text-lg text-gray-300 mb-6">
                  Ты прошёл все {totalLevels} уроков! Теперь ты мастер AI-разработки и можешь создавать что угодно!
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/projects">
                    <Button size="lg" className="gap-2">
                      Посмотреть проекты
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Форма отзыва */}
            {!alreadyReviewed && !reviewSubmitted && (
              <Card className="mt-6 glass premium-shadow border-2 border-purple-200">
                <CardContent className="p-6">
                  {!showReviewForm ? (
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">Оставь отзыв о курсе!</h3>
                      <p className="text-gray-600 mb-4">
                        Поделись своим опытом и помоги другим ученикам
                      </p>
                      <Button 
                        onClick={() => setShowReviewForm(true)}
                        className="gap-2"
                      >
                        <Star className="h-4 w-4" />
                        Написать отзыв
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Твой отзыв</h3>
                      
                      {/* Рейтинг */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Оценка:</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setReviewRating(rating)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star 
                                className={`h-8 w-8 ${
                                  rating <= reviewRating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Текст отзыва */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                          Расскажи о своём опыте (минимум 20 символов):
                        </label>
                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="w-full h-32 p-3 border-2 border-purple-200 rounded-lg focus:border-purple-400 focus:outline-none resize-none"
                          placeholder="Что тебе понравилось в курсе? Чему ты научился? Какие результаты получил?"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {reviewText.length} / минимум 20 символов
                        </p>
                      </div>
                      
                      {/* Кнопки */}
                      <div className="flex gap-3">
                        <Button
                          onClick={handleSubmitReview}
                          className="flex-1 gap-2"
                          disabled={reviewText.trim().length < 20}
                        >
                          <Send className="h-4 w-4" />
                          Отправить отзыв
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowReviewForm(false);
                            setReviewText("");
                            setReviewRating(5);
                          }}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Уведомление об отправленном отзыве */}
            {(alreadyReviewed || reviewSubmitted) && (
              <Card className="mt-6 border-green-500/30 bg-green-500/10 glass">
                <CardContent className="p-4 text-center">
                  <p className="text-green-700 font-medium">
                    ✓ Спасибо за отзыв! Он появится на главной странице
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
