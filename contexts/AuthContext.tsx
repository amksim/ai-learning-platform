"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  telegram_username: string | null;
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
  signup: (email: string, password: string, name: string, telegramUsername?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  updateProgress: (courseSlug: string, lessonIndex: number, codeSubmission?: string) => Promise<void>;
  updateProfile: (updates: { full_name?: string; telegram_username?: string }) => Promise<void>;
  completePurchase: (customerId: string, type: 'monthly' | 'yearly') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isCheckingUser = React.useRef(false);

  // Загрузка пользователя при старте
  useEffect(() => {
    checkUser();
    
    // Подписываемся на изменения auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // Не вызываем checkUser если уже идет проверка
        if (!isCheckingUser.current) {
          await checkUser();
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Проверка текущего пользователя
  async function checkUser() {
    // Защита от параллельных вызовов
    if (isCheckingUser.current) {
      console.log('⚠️ checkUser уже выполняется, пропускаем');
      return;
    }
    
    isCheckingUser.current = true;
    console.log('🔍 Начинаем checkUser...');
    
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        setUser(null);
        return;
      }
      
      if (!authUser) {
        console.log('👤 Пользователь не авторизован');
        setUser(null);
        return;
      }

      console.log('👤 Загружаем профиль для:', authUser.email);
      
      // Загружаем профиль
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('❌ Ошибка загрузки профиля:', profileError);
        // Если профиля нет - это проблема, пользователь не может использовать сайт
        setUser(null);
        return;
      }

      if (!profile) {
        console.error('❌ Профиль не найден для пользователя:', authUser.id);
        setUser(null);
        return;
      }

      console.log('✅ Профиль загружен:', profile.full_name);

      // Загружаем прогресс из базы
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('completed', true);

      const completedCount = progressData?.length || 0;
      const completedLessonIds = progressData?.map(p => p.lesson_index) || [];

      console.log('📊 Прогресс:', completedCount, 'уроков пройдено');

      setUser({
        id: authUser.id,
        email: authUser.email!,
        full_name: profile.full_name || 'User',
        telegram_username: profile.telegram_username || null,
        progress: completedCount,
        completedLessons: completedLessonIds,
        joinedDate: profile.created_at || new Date().toISOString(),
        hasPaid: profile.subscription_status === 'premium',
        subscription_status: profile.subscription_status || 'free',
        subscription_end_date: profile.subscription_end_date || null,
        stripe_customer_id: profile.stripe_customer_id || null,
      });
    } catch (error) {
      console.error('❌ Критическая ошибка checkUser:', error);
      setUser(null);
    } finally {
      setLoading(false);
      isCheckingUser.current = false;
    }
  }

  // Регистрация
  async function signup(email: string, password: string, name: string, telegramUsername?: string) {
    console.log('📝 Регистрация:', email);
    
    // Если имя не введено, используем первую часть email
    const userName = name.trim() || email.split('@')[0];

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

      // 4. Получаем реферальный код из localStorage
      const referralCode = typeof window !== 'undefined' ? localStorage.getItem('referral_code') : null;
      console.log('🔗 Реферальный код:', referralCode);

      // 5. Создаём профиль
      console.log('📝 Создаём профиль...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: userName,
          telegram_username: telegramUsername || null,
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

      // 6. Создаём запись в users для реферальной системы
      console.log('📝 Создаём user для реферальной системы...');
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: userName,
          referred_by: referralCode || null,
        });

      if (userError) {
        console.error('❌ User error:', userError);
        // Игнорируем если уже существует
        if (!userError.message.includes('duplicate') && !userError.code?.includes('23505')) {
          console.error('User creation failed but continuing:', userError);
        }
      } else {
        console.log('✅ User created');
        
        // Если есть реферальный код, создаём запись в referrals
        if (referralCode) {
          console.log('📝 Создаём запись реферала...');
          const { error: refError } = await supabase.rpc('create_referral_record', {
            p_referral_code: referralCode,
            p_referred_id: authData.user.id
          });
          
          if (refError) {
            console.error('❌ Referral record error:', refError);
          } else {
            console.log('✅ Referral record created');
            // Очищаем код из localStorage
            if (typeof window !== 'undefined') {
              localStorage.removeItem('referral_code');
            }
          }
        }
      }

      // 7. Ждём ещё 500ms
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
      
      console.log('✅ Регистрация завершена!');
      
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      throw err;
    }
  }

  // Вход
  async function login(email: string, password: string) {
    console.log('🔐 Вход:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    console.log('✅ Logged in:', data.user?.id);

    // Загружаем пользователя - onAuthStateChange тоже вызовет checkUser,
    // но защита от параллельных вызовов предотвратит дублирование
    await checkUser();
    
    console.log('✅ Login завершен');
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

    // Проверяем существует ли запись
    const { data: existing } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_index', lessonIndex)
      .single();

    let error;
    
    if (existing) {
      // Обновляем существующую
      console.log('📝 Обновляем существующую запись');
      const result = await supabase
        .from('user_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('lesson_index', lessonIndex);
      error = result.error;
    } else {
      // Создаем новую
      console.log('➕ Создаем новую запись');
      const result = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          course_slug: courseSlug,
          lesson_index: lessonIndex,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      error = result.error;
    }

    if (error) {
      console.error('❌ Ошибка сохранения прогресса:', error);
      throw error;
    }

    console.log('✅ Прогресс сохранен в базу!');

    // КРИТИЧНО: Перезагружаем данные из базы для синхронизации
    await checkUser();

    console.log('✅ Прогресс обновлен и синхронизирован с базой!');
  }

  // Обновление профиля
  async function updateProfile(updates: { full_name?: string; telegram_username?: string }) {
    if (!user) return;

    console.log('📝 Обновляем профиль:', updates);

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }

    console.log('✅ Профиль обновлен в базе!');

    // КРИТИЧНО: Перезагружаем данные из базы для синхронизации
    await checkUser();

    console.log('✅ Профиль синхронизирован!');
  }

  // Завершение покупки
  async function completePurchase(customerId: string, type: 'monthly' | 'yearly') {
    if (!user) return;

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (type === 'yearly' ? 12 : 1));

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'premium',
        stripe_customer_id: customerId,
        subscription_end_date: endDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('❌ Error updating subscription:', error);
      throw error;
    }

    console.log('✅ Подписка обновлена в базе!');

    // Начисляем реферальный бонус если пользователь был приглашён
    try {
      console.log('💰 Проверяем реферальный бонус...');
      const { error: bonusError } = await supabase.rpc('credit_referral_bonus', {
        referred_user_id: user.id
      });
      
      if (bonusError) {
        console.error('❌ Ошибка начисления бонуса:', bonusError);
      } else {
        console.log('✅ Реферальный бонус начислен!');
      }
    } catch (err) {
      console.error('❌ Ошибка при начислении реферального бонуса:', err);
    }

    // КРИТИЧНО: Перезагружаем данные из базы для синхронизации
    await checkUser();

    console.log('✅ Подписка синхронизирована!');
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
        updateProfile,
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
