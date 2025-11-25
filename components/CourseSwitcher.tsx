"use client";

import { useState, useEffect } from "react";
import { Lock, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

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
  const { user } = useAuth();

  // Проверка оплаты курса
  const isCoursePaid = (categoryId: number) => {
    if (!user) return false;
    // Если есть premium или курс в списке оплаченных
    return user.subscription_status === 'premium' || user.paidCourses?.includes(categoryId);
  };

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
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = activeCategory?.id === category.id;
          
          // Новые цвета для каждого курса
          const colorMap: Record<string, { bg: string; activeBg: string; border: string; text: string }> = {
            'blue': { 
              bg: 'bg-slate-800/60', 
              activeBg: 'bg-blue-600', 
              border: 'border-slate-700',
              text: 'text-blue-400'
            },
            'purple': { 
              bg: 'bg-slate-800/60', 
              activeBg: 'bg-purple-600', 
              border: 'border-slate-700',
              text: 'text-purple-400'
            },
            'orange': { 
              bg: 'bg-slate-800/60', 
              activeBg: 'bg-orange-600', 
              border: 'border-slate-700',
              text: 'text-orange-400'
            },
            'green': { 
              bg: 'bg-slate-800/60', 
              activeBg: 'bg-green-600', 
              border: 'border-slate-700',
              text: 'text-green-400'
            }
          };
          
          const colors = colorMap[category.color as keyof typeof colorMap] || colorMap.blue;
          
          const isPaid = isCoursePaid(category.id);
          
          return (
            <div key={category.id} className="flex items-center gap-1">
              <button
                onClick={() => onCategoryChange(category)}
                className={`
                  px-3 py-1.5 rounded-lg border transition-all font-semibold text-sm
                  ${isActive 
                    ? `${colors.activeBg} border-transparent text-white shadow-md` 
                    : `${colors.bg} ${colors.border} text-gray-400 hover:text-gray-300`
                  }
                  flex items-center gap-1.5
                `}
              >
                <span className="text-base">{category.icon}</span>
                <span>{category.title}</span>
                {!isPaid && user && (
                  <Lock className="h-3 w-3 text-yellow-500" />
                )}
                <span className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                  ({category.total_lessons})
                </span>
              </button>
              
              {/* Кнопка покупки для неоплаченного курса */}
              {!isPaid && user && isActive && (
                <Link
                  href={`/payment/course/${category.id}`}
                  className="px-2 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <ShoppingCart className="h-3 w-3" />
                  $62.50
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
