"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { AuthError, User as SupabaseUser } from "@supabase/supabase-js";

// ========================================
// ТИПЫ
// ========================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  progress: number;
  completedLessons: number[];
  joinedDate: string;
  hasPaid: boolean;
  paidCourses: number[];
  subscription_status: 'free' | 'premium';
  subscription_end_date: string | null;
  stripe_customer_id: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: { full_name?: string }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========================================
// ПРОВАЙДЕР
// ========================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Очистка ошибки
  const clearError = useCallback(() => setError(null), []);

  // ========================================
  // ЗАГРУЗКА ПРОФИЛЯ (с timeout 10 сек)
  // ========================================
  const loadUserProfile = useCallback(async (authUser: SupabaseUser): Promise<User | null> => {
    // Timeout чтобы не зависать вечно
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    );

    try {
      console.log('📋 Загрузка профиля для:', authUser.email);

      // 1. Пытаемся получить профиль с timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise.then(() => ({ data: null, error: { message: 'Timeout' } }))
      ]) as any;

      if (profileError && profileError.message !== 'Timeout') {
        console.error('❌ Ошибка загрузки профиля:', profileError);
      }

      // 2. Если профиля нет - создаём его
      if (!profile) {
        console.log('📝 Профиль не найден, создаём новый...');
        
        const newProfile = {
          id: authUser.id,
          email: authUser.email!,
          full_name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
          subscription_status: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Пробуем создать профиль
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (insertError) {
          console.error('❌ Ошибка создания профиля:', insertError);
        } else {
          console.log('✅ Профиль создан');
        }

        // Возвращаем базовый профиль в любом случае
        return {
          id: authUser.id,
          email: authUser.email!,
          full_name: newProfile.full_name,
          progress: 0,
          completedLessons: [],
          joinedDate: newProfile.created_at,
          hasPaid: false,
          paidCourses: [],
          subscription_status: 'free',
          subscription_end_date: null,
          stripe_customer_id: null,
        };
      }

      // 3. Загружаем прогресс
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('lesson_index')
        .eq('user_id', authUser.id)
        .eq('completed', true);

      const completedLessonIds = progressData?.map(p => p.lesson_index) || [];
      const paidCourses = profile.paid_courses || [];

      console.log('✅ Профиль загружен:', profile.full_name);

      return {
        id: authUser.id,
        email: authUser.email!,
        full_name: profile.full_name || 'User',
        progress: completedLessonIds.length,
        completedLessons: completedLessonIds,
        joinedDate: profile.created_at || new Date().toISOString(),
        hasPaid: profile.subscription_status === 'premium' || paidCourses.length > 0,
        paidCourses: paidCourses,
        subscription_status: profile.subscription_status || 'free',
        subscription_end_date: profile.subscription_end_date || null,
        stripe_customer_id: profile.stripe_customer_id || null,
      };
    } catch (err) {
      console.error('❌ Ошибка загрузки профиля:', err);
      return null;
    }
  }, []);

  // ========================================
  // СЛУШАТЕЛЬ AUTH ИЗМЕНЕНИЙ
  // ========================================
  useEffect(() => {
    let mounted = true;

    // Инициализация
    const initAuth = async () => {
      try {
        console.log('🔍 Инициализация авторизации...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Ошибка получения сессии:', error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (session?.user) {
          console.log('✅ Активная сессия найдена:', session.user.email);
          const userProfile = await loadUserProfile(session.user);
          if (mounted) {
            setUser(userProfile);
          }
        } else {
          console.log('👤 Нет активной сессии');
          if (mounted) {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('❌ Ошибка инициализации:', err);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Подписка на изменения auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth event:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await loadUserProfile(session.user);
          if (mounted) {
            setUser(userProfile);
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Токен обновлён - обновляем профиль
          const userProfile = await loadUserProfile(session.user);
          if (mounted) {
            setUser(userProfile);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // ========================================
  // РЕГИСТРАЦИЯ
  // ========================================
  const signup = useCallback(async (
    email: string, 
    password: string, 
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('📝 Регистрация:', email);
    setError(null);

    try {
      // Валидация
      if (!email || !password) {
        const errorMsg = 'Email и пароль обязательны';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (password.length < 6) {
        const errorMsg = 'Пароль должен быть минимум 6 символов';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Регистрация в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || email.split('@')[0],
          },
        },
      });

      if (authError) {
        console.error('❌ Ошибка регистрации:', authError);
        const errorMsg = translateAuthError(authError);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!authData.user) {
        const errorMsg = 'Не удалось создать пользователя';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      console.log('✅ Пользователь зарегистрирован:', authData.user.id);

      // Создаём профиль (если RLS разрешает)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: name || email.split('@')[0],
          subscription_status: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.warn('⚠️ Ошибка создания профиля (будет создан при входе):', profileError);
      }

      // Реферальная система (опционально)
      try {
        const referralCode = localStorage.getItem('referralCode');
        if (referralCode) {
          await supabase.from('users').insert({
            id: authData.user.id,
            email: email,
            full_name: name || email.split('@')[0],
            referred_by: referralCode,
          });
          localStorage.removeItem('referralCode');
        }
      } catch (e) {
        console.warn('⚠️ Реферальная система:', e);
      }

      // Проверяем нужно ли подтверждение email
      if (authData.session) {
        // Сессия есть - пользователь сразу авторизован
        console.log('✅ Регистрация завершена, сессия активна');
        return { success: true };
      } else {
        // Нужно подтверждение email
        console.log('📧 Требуется подтверждение email');
        return { 
          success: true, 
          error: 'Проверьте почту для подтверждения регистрации' 
        };
      }
    } catch (err: any) {
      console.error('❌ Неожиданная ошибка регистрации:', err);
      const errorMsg = err.message || 'Ошибка регистрации';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  // ========================================
  // ВХОД
  // ========================================
  const login = useCallback(async (
    email: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('🔐 Вход:', email);
    setError(null);

    try {
      // Валидация
      if (!email || !password) {
        const errorMsg = 'Email и пароль обязательны';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('❌ Ошибка входа:', authError);
        const errorMsg = translateAuthError(authError);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!data.session) {
        const errorMsg = 'Не удалось создать сессию';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      console.log('✅ Вход выполнен:', data.user?.email);
      return { success: true };
    } catch (err: any) {
      console.error('❌ Неожиданная ошибка входа:', err);
      const errorMsg = err.message || 'Ошибка входа';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  // ========================================
  // ВЫХОД
  // ========================================
  const logout = useCallback(async () => {
    console.log('👋 Выход');
    setError(null);
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // ========================================
  // ОБНОВЛЕНИЕ ПРОФИЛЯ
  // ========================================
  const updateProfile = useCallback(async (updates: { full_name?: string }) => {
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Ошибка обновления профиля:', updateError);
      throw updateError;
    }

    // Обновляем локальное состояние
    setUser(prev => prev ? { ...prev, ...updates } : null);
    console.log('✅ Профиль обновлен');
  }, [user]);

  // ========================================
  // РЕНДЕР
  // ========================================
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      signup, 
      login, 
      logout, 
      updateProfile, 
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ========================================
// ХЕЛПЕРЫ
// ========================================

function translateAuthError(error: AuthError): string {
  const message = error.message.toLowerCase();
  
  if (message.includes('invalid login credentials')) {
    return 'Неверный email или пароль';
  }
  if (message.includes('email not confirmed')) {
    return 'Email не подтверждён. Проверьте почту';
  }
  if (message.includes('user already registered')) {
    return 'Пользователь с таким email уже существует';
  }
  if (message.includes('password')) {
    return 'Пароль должен быть минимум 6 символов';
  }
  if (message.includes('email')) {
    return 'Некорректный email';
  }
  if (message.includes('rate limit')) {
    return 'Слишком много попыток. Подождите минуту';
  }
  if (message.includes('network')) {
    return 'Ошибка сети. Проверьте интернет';
  }
  
  return error.message || 'Произошла ошибка';
}

// ========================================
// ХУК
// ========================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
