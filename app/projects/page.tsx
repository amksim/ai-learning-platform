"use client";

import React from "react";
import { Code, Smartphone, Gamepad2, Trophy, ExternalLink, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/Card";

interface Project {
  id: number;
  title: string;
  author: string;
  description: string;
  category: "websites" | "apps" | "games";
  image: string;
  score: number;
  link: string;
  gradient: string;
}

// ✨ 13 ПРЕМИУМ ПРОЕКТОВ - ЛУЧШИЕ ИЗ ЛУЧШИХ
const projects: Project[] = [
  {
    id: 1,
    title: "AI Landing Page",
    author: "Алексей М.",
    description: "Современный лендинг для AI стартапа с анимациями и 3D эффектами",
    category: "websites",
    image: "🤖",
    score: 98,
    link: "https://www.midjourney.com",
    gradient: "from-purple-500 via-pink-500 to-blue-500",
  },
  {
    id: 2,
    title: "Spotify Clone",
    author: "Мария К.",
    description: "Полнофункциональный музыкальный плеер с плейлистами и поиском",
    category: "apps",
    image: "🎵",
    score: 96,
    link: "https://open.spotify.com",
    gradient: "from-green-500 via-emerald-500 to-teal-500",
  },
  {
    id: 3,
    title: "Cyber Racer 3D",
    author: "Дмитрий В.",
    description: "Гоночная игра в киберпанк стиле с мультиплеером",
    category: "games",
    image: "🏎️",
    score: 94,
    link: "https://bruno-simon.com",
    gradient: "from-cyan-500 via-blue-500 to-purple-500",
  },
  {
    id: 4,
    title: "E-Commerce Pro",
    author: "София Д.",
    description: "Интернет-магазин премиум класса с корзиной и оплатой Stripe",
    category: "websites",
    image: "🛍️",
    score: 95,
    link: "https://vercel.com/templates/next.js/nextjs-commerce",
    gradient: "from-orange-500 via-red-500 to-pink-500",
  },
  {
    id: 5,
    title: "Weather AI",
    author: "Иван П.",
    description: "Умный прогноз погоды с AI предсказаниями и красивой визуализацией",
    category: "apps",
    image: "⛅",
    score: 93,
    link: "https://weather.com",
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
  },
  {
    id: 6,
    title: "Space Invaders Remake",
    author: "Анна С.",
    description: "Классическая аркада с современной графикой и звуком",
    category: "games",
    image: "👾",
    score: 91,
    link: "https://freeinvaders.org",
    gradient: "from-purple-500 via-violet-500 to-pink-500",
  },
  {
    id: 7,
    title: "Portfolio 3D",
    author: "Максим Л.",
    description: "Интерактивное 3D портфолио с Three.js и анимациями",
    category: "websites",
    image: "💼",
    score: 97,
    link: "https://brittanychiang.com",
    gradient: "from-amber-500 via-orange-500 to-red-500",
  },
  {
    id: 8,
    title: "TaskFlow Pro",
    author: "Елена Н.",
    description: "Менеджер задач с канбан доской, дедлайнами и командной работой",
    category: "apps",
    image: "✅",
    score: 92,
    link: "https://linear.app",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
  },
  {
    id: 9,
    title: "Puzzle Master",
    author: "Сергей Т.",
    description: "Коллекция логических головоломок с уровнями сложности",
    category: "games",
    image: "🧩",
    score: 89,
    link: "https://www.coolmathgames.com",
    gradient: "from-teal-500 via-cyan-500 to-blue-500",
  },
  {
    id: 10,
    title: "Restaurant Premium",
    author: "Ольга Р.",
    description: "Премиум сайт ресторана с бронированием столиков и онлайн-меню",
    category: "websites",
    image: "🍽️",
    score: 94,
    link: "https://restaurant-demo.netlify.app",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
  },
  {
    id: 11,
    title: "Crypto Tracker",
    author: "Артём Ж.",
    description: "Отслеживание криптовалют в реальном времени с графиками",
    category: "apps",
    image: "💰",
    score: 90,
    link: "https://coinmarketcap.com",
    gradient: "from-yellow-500 via-orange-500 to-red-500",
  },
  {
    id: 12,
    title: "Tower Defense",
    author: "Виктор Б.",
    description: "Стратегическая игра защиты башен с апгрейдами",
    category: "games",
    image: "🏰",
    score: 88,
    link: "https://www.crazygames.com/game/tower-defense",
    gradient: "from-emerald-500 via-green-500 to-lime-500",
  },
  {
    id: 13,
    title: "Travel Blog",
    author: "Наталья К.",
    description: "Блог о путешествиях с картой мира и галереей фотографий",
    category: "websites",
    image: "✈️",
    score: 91,
    link: "https://nomadlist.com",
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
  },
];

export default function ProjectsPage() {
  const { t } = useLanguage();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "websites":
        return Code;
      case "apps":
        return Smartphone;
      case "games":
        return Gamepad2;
      default:
        return Code;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "websites":
        return "Сайт";
      case "apps":
        return "Приложение";
      case "games":
        return "Игра";
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-400">13 лучших проектов</span>
          </div>
          <h1 className="mb-4 text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {t.home.projects_title}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Вдохновляйся работами других учеников и делись своими проектами
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const CategoryIcon = getCategoryIcon(project.category);
            
            return (
              <a 
                key={project.id}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <Card className="h-full glass border-2 border-purple-400/20 hover:border-purple-400/60 premium-shadow overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
                  {/* Image Section with Gradient */}
                  <div className={`relative h-48 flex items-center justify-center bg-gradient-to-br ${project.gradient} transition-all duration-300 group-hover:scale-105`}>
                    {/* Emoji */}
                    <div className="text-7xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 drop-shadow-2xl">
                      {project.image}
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center gap-1.5 border border-purple-200">
                      <CategoryIcon className="h-3.5 w-3.5 text-purple-600" />
                      <span className="text-xs font-bold text-purple-600">{getCategoryLabel(project.category)}</span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 rounded-full p-3 transform scale-75 group-hover:scale-100">
                        <ExternalLink className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-pink-300 transition-all">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3 font-medium">от {project.author}</p>
                    <p className="text-sm text-gray-300 leading-relaxed mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    {/* Score */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg">
                        <Trophy className="h-4 w-4" />
                        <span className="text-sm font-bold">{project.score}/100</span>
                      </div>
                      <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
                        <ExternalLink className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>

        {/* CTA Section */}
        <Card className="mt-16 glass border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 premium-shadow">
          <CardContent className="flex flex-col items-center gap-6 p-8 md:p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Создай свой проект!
            </h2>
            <p className="max-w-2xl text-gray-300 text-lg">
              Начни обучение сегодня и скоро твой проект тоже будет здесь. Присоединяйся к нашему комьюнити!
            </p>
            <a href="/courses">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold transition-all premium-shadow hover:scale-105 text-lg flex items-center gap-2">
                Начать обучение
                <ExternalLink className="h-5 w-5" />
              </button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
