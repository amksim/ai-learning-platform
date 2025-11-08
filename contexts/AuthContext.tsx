"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  full_name: string;
  hasPaid: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProgress: (courseSlug: string, lessonIndex: number) => Promise<void>;
  completePurchase: (customerId: string, type: string) => Promise<void>;
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
          setUser({
            id: authUser.id,
            email: authUser.email!,
            full_name: profile.full_name || 'User',
            hasPaid: profile.has_purchased || false,
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

    // 1. Создаём пользователя
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User not created');

    console.log('✅ Auth user created:', authData.user.id);

    // 2. Создаём профиль
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: name,
        has_purchased: false,
      });

    if (profileError && !profileError.message.includes('duplicate')) {
      console.error('Profile error:', profileError);
      throw profileError;
    }

    console.log('✅ Profile created');

    // 3. Логинимся
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) throw loginError;

    console.log('✅ Logged in');

    // 4. Загружаем пользователя
    await checkUser();
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

  // Обновление прогресса
  async function updateProgress(courseSlug: string, lessonIndex: number) {
    if (!user) return;

    await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        course_slug: courseSlug,
        lesson_index: lessonIndex,
        completed: true,
        updated_at: new Date().toISOString(),
      });
  }

  // Завершение покупки
  async function completePurchase(customerId: string, type: string) {
    if (!user) return;

    await supabase
      .from('profiles')
      .update({
        has_purchased: true,
        stripe_customer_id: customerId,
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
