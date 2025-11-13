"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  progress: number;
  completedLessons: number[]; // Массив ID пройденных уроков
  joinedDate: string;
  hasPaid: boolean;
  subscription_status: 'free' | 'premium';
  subscription_end_date: string | null;
  stripe_customer_id: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  updateProgress: (courseSlug: string, lessonIndex: number, codeSubmission?: string) => Promise<void>;
  completePurchase: (customerId: string, type: 'monthly' | 'yearly') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка пользователя при старте
  useEffect(() => {
    checkUser();
  }, []);

  // Проверка текущего пользователя
  async function checkUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Загружаем профиль
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          // Загружаем прогресс из базы
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', authUser.id)
            .eq('completed', true);

          const completedCount = progressData?.length || 0;
          const completedLessonIds = progressData?.map(p => p.lesson_index) || [];

          setUser({
            id: authUser.id,
            email: authUser.email!,
            full_name: profile.full_name || 'User',
            progress: completedCount,
            completedLessons: completedLessonIds,
            joinedDate: profile.created_at || new Date().toISOString(),
            hasPaid: profile.subscription_status === 'premium',
            subscription_status: profile.subscription_status || 'free',
            subscription_end_date: profile.subscription_end_date || null,
            stripe_customer_id: profile.stripe_customer_id || null,
          });
        }
      }
    } catch (error) {
      console.error('Check user error:', error);
    } finally {
      setLoading(false);
    }
  }

  // Регистрация
  async function signup(email: string, password: string, name: string) {
    console.log('📝 Регистрация:', email);

    try {
      // 1. Проверяем - может пользователь уже есть?
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (existingUser?.user) {
        console.log('✅ Пользователь уже существует, входим');
        await checkUser();
        return;
      }
    } catch (e) {
      // Пользователя нет, продолжаем регистрацию
      console.log('📝 Новый пользователь, создаём');
    }

    try {
      // 2. Создаём пользователя
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        // Если email уже занят - пробуем войти
        if (authError.message?.includes('already') || authError.message?.includes('registered')) {
          console.log('⚠️ Email занят, пробуем войти');
          throw new Error('Email уже зарегистрирован! Используйте вход.');
        }
        console.error('❌ Auth error:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('User not created');
      }

      console.log('✅ Auth user created:', authData.user.id);

      // 3. Ждём 500ms
      await new Promise(resolve => setTimeout(resolve, 500));

      // 4. Создаём профиль
      console.log('📝 Создаём профиль...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: name,
          subscription_status: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('❌ Profile error:', profileError);
        // Игнорируем ошибку дубликата
        if (!profileError.message.includes('duplicate') && 
            !profileError.message.includes('already exists') &&
            !profileError.code?.includes('23505')) {
          throw profileError;
        }
        console.log('⚠️ Профиль уже существует, игнорируем');
      } else {
        console.log('✅ Profile created');
      }

      // 5. Ждём ещё 500ms
      await new Promise(resolve => setTimeout(resolve, 500));

      // 6. Логинимся
      console.log('📝 Выполняем вход...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        console.error('❌ Login error:', loginError);
        throw loginError;
      }

      console.log('✅ Logged in');

      // 7. Загружаем пользователя
      console.log('📝 Загружаем профиль...');
      await checkUser();
      console.log('✅ Всё готово!');
      
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      throw err;
    }
  }

  // Вход
  async function login(email: string, password: string) {
    console.log('🔐 Вход:', email);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    console.log('✅ Logged in');

    await checkUser();
  }

  // Выход
  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  // Magic Link (для совместимости, но не используется)
  async function sendMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/courses`,
      },
    });
    if (error) throw error;
  }

  // Обновление прогресса
  async function updateProgress(courseSlug: string, lessonIndex: number, codeSubmission?: string) {
    if (!user) return;

    // Проверяем - уже пройден?
    if (user.completedLessons.includes(lessonIndex)) {
      console.log('✅ Урок уже пройден:', lessonIndex);
      return;
    }

    console.log('💾 Сохраняем прогресс:', lessonIndex);

    // Сохраняем в базу
    await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        course_slug: courseSlug,
        lesson_index: lessonIndex,
        completed: true,
        code_submission: codeSubmission || null,
        completed_at: new Date().toISOString(),
      });

    // Обновляем локально
    setUser(prev => prev ? {
      ...prev,
      progress: prev.progress + 1,
      completedLessons: [...prev.completedLessons, lessonIndex]
    } : null);

    console.log('✅ Прогресс сохранен!');
  }

  // Завершение покупки
  async function completePurchase(customerId: string, type: 'monthly' | 'yearly') {
    if (!user) return;

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (type === 'yearly' ? 12 : 1));

    await supabase
      .from('profiles')
      .update({
        subscription_status: 'premium',
        stripe_customer_id: customerId,
        subscription_end_date: endDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    await checkUser();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        sendMagicLink,
        updateProgress,
        completePurchase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
