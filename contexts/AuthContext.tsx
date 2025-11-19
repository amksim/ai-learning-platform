"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Типы
export interface User {
  id: string;
  email: string;
  full_name: string;
  telegram_username: string | null;
  progress: number;
  completedLessons: number[];
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка при старте
  useEffect(() => {
    loadUser();
  }, []);

  // Простая функция загрузки пользователя
  async function loadUser() {
    try {
      console.log('🔍 Загрузка пользователя...');
      
      // 1. Получаем текущего пользователя из Supabase Auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.log('👤 Пользователь не авторизован');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('✅ Auth пользователь найден:', authUser.email);

      // 2. Загружаем профиль из базы
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError || !profile) {
        console.error('❌ Профиль не найден:', profileError);
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('✅ Профиль загружен:', profile.full_name);

      // 3. Загружаем прогресс
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('completed', true);

      const completedCount = progressData?.length || 0;
      const completedLessonIds = progressData?.map(p => p.lesson_index) || [];

      // 4. Устанавливаем пользователя
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

      console.log('✅ Пользователь загружен успешно');
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Регистрация
  async function signup(email: string, password: string, name: string, telegramUsername?: string) {
    console.log('📝 Регистрация:', email);

    try {
      // 1. Регистрируем пользователя в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Не удалось создать пользователя');

      console.log('✅ Пользователь зарегистрирован:', authData.user.id);

      // 2. Создаем профиль
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: name || email.split('@')[0],
          telegram_username: telegramUsername || null,
          subscription_status: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('❌ Ошибка создания профиля:', profileError);
        throw profileError;
      }

      console.log('✅ Профиль создан');

      // 3. Создаем запись в users для реферальной системы
      const referralCode = localStorage.getItem('referralCode');
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          full_name: name || email.split('@')[0],
          referred_by: referralCode || null,
        });

      if (userError) {
        console.warn('⚠️ Ошибка создания users (не критично):', userError);
      }

      // 4. Очищаем referral code
      localStorage.removeItem('referralCode');

      // 5. Логин автоматически
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      // 6. Загружаем пользователя
      await loadUser();

      console.log('✅ Регистрация завершена');
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      throw error;
    }
  }

  // Вход
  async function login(email: string, password: string) {
    console.log('🔐 Вход:', email);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('✅ Вход выполнен');

      // Загружаем пользователя
      await loadUser();
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      throw error;
    }
  }

  // Выход
  async function logout() {
    console.log('👋 Выход');
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
