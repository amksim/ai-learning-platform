"use client";

import { useState, useEffect } from "react";

interface CourseCategory {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  total_lessons: number;
  display_order: number;
}

interface CourseSwitcherProps {
  activeCategory: CourseCategory | null;
  onCategoryChange: (category: CourseCategory) => void;
}

export default function CourseSwitcher({ activeCategory, onCategoryChange }: CourseSwitcherProps) {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/course-categories');
      const data = await response.json();
      
      if (data.categories) {
        setCategories(data.categories);
        
        // Выбираем первый курс по умолчанию
        if (!activeCategory && data.categories.length > 0) {
          onCategoryChange(data.categories[0]);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 w-48 h-32 rounded-xl bg-gray-800/50 animate-pulse" />
        ))}
      </div>
    );
  }

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: {
        border: isActive ? 'border-blue-500' : 'border-blue-500/30',
        bg: isActive ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' : 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
        text: 'text-blue-400',
        hover: 'hover:border-blue-500/50 hover:from-blue-500/15 hover:to-cyan-500/15'
      },
      purple: {
        border: isActive ? 'border-purple-500' : 'border-purple-500/30',
        bg: isActive ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
        text: 'text-purple-400',
        hover: 'hover:border-purple-500/50 hover:from-purple-500/15 hover:to-pink-500/15'
      },
      orange: {
        border: isActive ? 'border-orange-500' : 'border-orange-500/30',
        bg: isActive ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20' : 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
        text: 'text-orange-400',
        hover: 'hover:border-orange-500/50 hover:from-orange-500/15 hover:to-red-500/15'
      },
      green: {
        border: isActive ? 'border-green-500' : 'border-green-500/30',
        bg: isActive ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
        text: 'text-green-400',
        hover: 'hover:border-green-500/50 hover:from-green-500/15 hover:to-emerald-500/15'
      }
    };
    
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-3 text-gray-300">
        Выбери курс:
      </h2>
      
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const isActive = activeCategory?.id === category.id;
          const colorClasses = getColorClasses(category.color, isActive);
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category)}
              className={`
                px-5 py-2.5 rounded-full border-2 transition-all font-semibold text-sm
                ${colorClasses.border}
                ${colorClasses.bg}
                ${colorClasses.hover}
                ${isActive ? `scale-105 shadow-lg ${colorClasses.text}` : 'text-gray-400'}
                flex items-center gap-2
              `}
            >
              <span className="text-lg">{category.icon}</span>
              <span>{category.title}</span>
              <span className="text-xs opacity-70">({category.total_lessons})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
