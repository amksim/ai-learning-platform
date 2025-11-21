import { Sparkles, Code, Smartphone, Gamepad2, Layers, FileCode, Palette, Zap, Boxes, Globe, Settings, Terminal, GitBranch, Database, Lock, CreditCard, TrendingUp, Layout, Monitor, Check } from "lucide-react";
import { LessonImageData } from "@/components/LessonImage";
import { LessonVideoData } from "@/components/LessonVideo";
import { TranslatedContent } from "@/lib/translateContent";

export interface Level {
  id: number;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  topics: string[];
  category: "foundation" | "html" | "css" | "javascript" | "typescript" | "react" | "nextjs" | "nodejs" | "databases" | "games" | "apis" | "deployment" | "advanced" | "practice";
  icon: any;
  blockName?: string;
  practice?: boolean; // Есть ли практическое задание
  practiceDescription?: string; // Описание практики
  isFree?: boolean; // Бесплатный урок или платный
  translations?: Record<string, TranslatedContent>; // Auto-translated content with videoUrl support
  images?: LessonImageData[]; // Картинки урока
  videos?: LessonVideoData[]; // Видео урока
  displayOrder?: number; // Порядок отображения
  courseCategoryId?: number; // ID категории курса (1-Сайты, 2-Приложения, 3-Игры, 4-Платежи)
}

// 🌊 ПОЛНЫЙ КУРС "СОЗДАВАЙ С AI" - НАЧАЛЬНАЯ СТРУКТУРА
// Курсы загружаются из Supabase через API
// Это только пустой массив для типизации
export const allCourseLevels: Level[] = [];

// Количество бесплатных уроков - теперь динамическое!
// Устанавливается в админке через галочку "Бесплатный урок"
export const freeLessonsCount = 999; // Нет лимита - админ решает сам
