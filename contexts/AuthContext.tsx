"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, type Profile } from "@/lib/supabase";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  progress: number;
  joinedDate: string;
  hasPaid: boolean;
  subscription_status: 'free' | 'premium';
  subscription_end_date: string | null;
  stripe_customer_id: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProgress: (courseSlug: string, lessonIndex: number, codeSubmission?: string) => Promise<void>;
  completePurchase: (stripeCustomerId: string, subscriptionType: 'monthly' | 'yearly') => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка профиля пользователя
  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;

      if (profile) {
        // Получаем прогресс
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', profile.id);

        const totalCompleted = progressData?.filter(p => p.completed).length || 0;

        setUser({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          progress: totalCompleted,
          joinedDate: profile.created_at,
          hasPaid: profile.subscription_status === 'premium',
          subscription_status: profile.subscription_status,
          subscription_end_date: profile.subscription_end_date,
          stripe_customer_id: profile.stripe_customer_id,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Проверка сессии при загрузке
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Подписка на изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Регистрация
  const signup = async (email: string, password: string, fullName?: string) => {
    // Шаг 1: Регистрация
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
        },
      },
    });

    if (error) throw error;
    
    if (!data.user) {
      throw new Error('Ошибка регистрации: пользователь не создан');
    }

    // Шаг 2: ВСЕГДА делаем вход после регистрации
    console.log('🔄 Выполняем вход после регистрации...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) throw loginError;

    // Шаг 3: Загружаем профиль
    if (loginData.user) {
      await loadUserProfile(loginData.user);
      console.log('✅ Регистрация и вход выполнены успешно!');
    }
  };

  // Вход
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Загружаем профиль после входа
    if (data.user) {
      await loadUserProfile(data.user);
    }
  };

  // Magic Link (вход по email без пароля)
  const sendMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/courses`,
      },
    });

    if (error) throw error;
  };

  // Выход
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  // Обновление прогресса
  const updateProgress = async (courseSlug: string, lessonIndex: number, codeSubmission?: string) => {
    if (!user) return;

    try {
      // Проверяем существующий прогресс
      const { data: existing } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_slug', courseSlug)
        .eq('lesson_index', lessonIndex)
        .single();

      if (existing) {
        // Обновляем
        await supabase
          .from('user_progress')
          .update({
            completed: true,
            code_solution: codeSubmission,
            completed_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Создаём новую запись
        await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            course_slug: courseSlug,
            lesson_index: lessonIndex,
            completed: true,
            code_solution: codeSubmission,
            completed_at: new Date().toISOString(),
          });
      }

      // Обновляем локальный прогресс
      setUser(prev => prev ? { ...prev, progress: prev.progress + 1 } : null);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Завершение покупки
  const completePurchase = async (stripeCustomerId: string, subscriptionType: 'monthly' | 'yearly') => {
    if (!user) return;

    try {
      const subscriptionEndDate = new Date();
      if (subscriptionType === 'monthly') {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      } else {
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
      }

      // Обновляем профиль
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'premium',
          subscription_end_date: subscriptionEndDate.toISOString(),
          stripe_customer_id: stripeCustomerId,
        })
        .eq('id', user.id);

      // Обновляем локальное состояние
      setUser(prev => prev ? {
        ...prev,
        hasPaid: true,
        subscription_status: 'premium',
        subscription_end_date: subscriptionEndDate.toISOString(),
        stripe_customer_id: stripeCustomerId,
      } : null);
    } catch (error) {
      console.error('Error completing purchase:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      login, 
      signup,
      logout, 
      updateProgress, 
      completePurchase,
      sendMagicLink,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
