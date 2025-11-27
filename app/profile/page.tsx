"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Trophy, Target, ArrowRight, Star, Award, Zap, TrendingUp, CheckCircle, Flame, Book, Send } from "lucide-react";
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
  const [totalLevels, setTotalLevels] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [existingLessonIds, setExistingLessonIds] = useState<number[]>([]);
  const [courseCategories, setCourseCategories] = useState<any[]>([]);
  const [coursesData, setCoursesData] = useState<any[]>([]);

  // Загружаем категории курсов и уроки
  useEffect(() => {
    const loadData = async () => {
      try {
        // Загружаем категории курсов
        const categoriesRes = await fetch('/api/course-categories');
        const categoriesData = await categoriesRes.json();
        
        // Загружаем все уроки
        const coursesRes = await fetch('/api/courses');
        const coursesDataRes = await coursesRes.json();
        
        if (categoriesData.categories) {
          setCourseCategories(categoriesData.categories);
          console.log(`📂 Загружено ${categoriesData.categories.length} категорий курсов`);
        }
        
        if (coursesDataRes.courses) {
          setCoursesData(coursesDataRes.courses);
          setTotalLevels(coursesDataRes.courses.length);
          const lessonIds = coursesDataRes.courses.map((course: { id: number }) => course.id);
          setExistingLessonIds(lessonIds);
          console.log(`📚 Загружено ${coursesDataRes.courses.length} уроков`);
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Removed redirect - causes issues when resetting payment status
  // User check is handled in Navigation component

  if (!user) {
    return null;
  }

  // Считаем только те пройденные уроки, которые РЕАЛЬНО существуют в базе
  // Это исправляет проблему когда уроки добавляются/удаляются
  const completedLevels = existingLessonIds.length > 0
    ? user.completedLessons?.filter(id => existingLessonIds.includes(id)).length || 0
    : user.completedLessons?.length || user.progress || 0;
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
  const joinedDate = user.created_at ? new Date(user.created_at) : new Date();
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

          {/* Курсов */}
          <Card className="glass border-2 border-green-500/20 hover:border-green-500/40 transition-all premium-shadow">
            <CardContent className="p-4 sm:p-5 md:p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <Target className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                {courseCategories.length || 4}
              </div>
              <div className="text-xs text-gray-400">Курсов</div>
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

        {/* Прогресс по каждому курсу */}
        {courseCategories.length > 0 && (
          <Card className="mb-8 glass border-2 border-blue-500/20 premium-shadow">
            <CardContent className="p-5 sm:p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                <Book className="h-6 w-6 text-blue-400" />
                Прогресс по курсам
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseCategories.map((category) => {
                  // Уроки этой категории
                  const categoryLessons = coursesData.filter(c => c.course_category_id === category.id);
                  const categoryLessonIds = categoryLessons.map(l => l.id);
                  // Пройденные уроки этой категории
                  const completedInCategory = user?.completedLessons?.filter(id => categoryLessonIds.includes(id)).length || 0;
                  const totalInCategory = categoryLessons.length;
                  const categoryProgress = totalInCategory > 0 ? Math.round((completedInCategory / totalInCategory) * 100) : 0;
                  
                  // Цвета для разных курсов
                  const colors = [
                    { border: 'border-purple-500/30', bg: 'from-purple-500/10 to-pink-500/10', bar: 'from-purple-600 to-pink-600', text: 'text-purple-400' },
                    { border: 'border-blue-500/30', bg: 'from-blue-500/10 to-cyan-500/10', bar: 'from-blue-600 to-cyan-600', text: 'text-blue-400' },
                    { border: 'border-green-500/30', bg: 'from-green-500/10 to-emerald-500/10', bar: 'from-green-600 to-emerald-600', text: 'text-green-400' },
                    { border: 'border-orange-500/30', bg: 'from-orange-500/10 to-red-500/10', bar: 'from-orange-600 to-red-600', text: 'text-orange-400' },
                  ];
                  const colorIndex = (category.display_order - 1) % colors.length;
                  const color = colors[colorIndex];
                  
                  return (
                    <div 
                      key={category.id}
                      className={`p-4 rounded-xl border-2 ${color.border} bg-gradient-to-br ${color.bg} hover:scale-[1.02] transition-all cursor-pointer`}
                      onClick={() => router.push(`/courses?category=${category.slug}`)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl`}>{category.icon || '📚'}</div>
                          <div>
                            <h3 className="font-bold text-white">{category.title}</h3>
                            <p className="text-xs text-gray-400">{totalInCategory} уроков</p>
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${color.text}`}>
                          {categoryProgress}%
                        </div>
                      </div>
                      
                      {/* Прогресс-бар */}
                      <div className="relative h-3 overflow-hidden rounded-full bg-gray-800 border border-gray-700">
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${color.bar} transition-all duration-500`}
                          style={{ width: `${categoryProgress}%` }}
                        />
                      </div>
                      
                      <div className="mt-2 flex justify-between text-xs text-gray-400">
                        <span>{completedInCategory} из {totalInCategory} пройдено</span>
                        {categoryProgress === 100 && <span className="text-green-400">✓ Завершено</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

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
