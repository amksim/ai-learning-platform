"use client";

import { useState } from "react";
import { Card } from "./ui/Card";
import { Clock, BookOpen, Target, Check } from "lucide-react";

interface CourseCategory {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  total_lessons: number;
  total_pages: number;
  total_video_minutes: number;
  total_tasks: number;
}

interface CourseSwitcherProps {
  categories: CourseCategory[];
  activeCategory: CourseCategory | null;
  onCategoryChange: (category: CourseCategory) => void;
}

const colorMap: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  blue: {
    bg: 'from-blue-500 via-cyan-500 to-teal-500',
    border: 'border-blue-400/40',
    text: 'text-blue-400',
    gradient: 'from-blue-400 to-cyan-400'
  },
  purple: {
    bg: 'from-purple-500 via-pink-500 to-rose-500',
    border: 'border-purple-400/40',
    text: 'text-purple-400',
    gradient: 'from-purple-400 to-pink-400'
  },
  orange: {
    bg: 'from-orange-500 via-red-500 to-pink-500',
    border: 'border-orange-400/40',
    text: 'text-orange-400',
    gradient: 'from-orange-400 to-red-400'
  },
  green: {
    bg: 'from-green-500 via-emerald-500 to-teal-500',
    border: 'border-green-400/40',
    text: 'text-green-400',
    gradient: 'from-green-400 to-emerald-400'
  },
};

export default function CourseSwitcher({ categories, activeCategory, onCategoryChange }: CourseSwitcherProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}м`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
  };

  return (
    <div className="mb-12">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Выбери свой курс
        </h2>
        <p className="text-gray-300 text-lg">
          4 направления от нуля до профи
        </p>
      </div>

      {/* Сетка курсов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {categories.map((category) => {
          const isActive = activeCategory?.id === category.id;
          const colors = colorMap[category.color] || colorMap.blue;

          return (
            <Card
              key={category.id}
              onClick={() => onCategoryChange(category)}
              className={`
                relative cursor-pointer transition-all duration-300 overflow-hidden
                ${isActive 
                  ? `border-2 ${colors.border} scale-105 shadow-2xl shadow-${category.color}-500/30` 
                  : 'border-2 border-white/10 hover:border-white/30 hover:scale-102'
                }
                glass premium-shadow group
              `}
            >
              {/* Активная галочка */}
              {isActive && (
                <div className="absolute top-3 right-3 z-10">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center shadow-lg`}>
                    <Check className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}

              {/* Иконка с градиентом */}
              <div className={`h-32 bg-gradient-to-br ${colors.bg} flex items-center justify-center transition-all ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                <div className="text-6xl drop-shadow-2xl">
                  {category.icon}
                </div>
              </div>

              {/* Контент */}
              <div className="p-4">
                <h3 className={`text-xl font-bold mb-2 bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                  {category.title}
                </h3>
                
                {/* Статистика */}
                <div className="space-y-2 mb-3">
                  {/* Уроков */}
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${colors.bg} bg-opacity-20`}>
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium">{category.total_lessons} уроков</span>
                  </div>

                  {/* Время видео */}
                  {category.total_video_minutes > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-r ${colors.bg} bg-opacity-20`}>
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <span>{formatTime(category.total_video_minutes)} видео</span>
                    </div>
                  )}

                  {/* Страниц текста */}
                  {category.total_pages > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-r ${colors.bg} bg-opacity-20`}>
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <span>{category.total_pages} стр. текста</span>
                    </div>
                  )}

                  {/* Заданий */}
                  {category.total_tasks > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-r ${colors.bg} bg-opacity-20`}>
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span>{category.total_tasks} заданий</span>
                    </div>
                  )}
                </div>

                {/* Кнопка */}
                <button
                  className={`
                    w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all
                    ${isActive
                      ? `bg-gradient-to-r ${colors.bg} text-white shadow-lg`
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }
                  `}
                >
                  {isActive ? 'Выбрано' : 'Выбрать'}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
