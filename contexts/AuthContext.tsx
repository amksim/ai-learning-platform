"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

// ========================================
// ТИПЫ
// ========================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  subscription_status: "free" | "premium";
  paid_courses: number[];
  created_at: string;
  // Для совместимости со старым кодом
  hasPaid: boolean;
  paidCourses: number[];
  completedLessons: number[];
  progress: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  // Алиасы для совместимости
  loading: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: { full_name?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ========================================
// ПРОВАЙДЕР
// ========================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка профиля из БД
  async function loadProfile(authUser: SupabaseUser): Promise<User | null> {
    try {
      console.log("📋 Загрузка профиля:", authUser.email);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error || !data) {
        console.log("⏳ Профиль не найден, ждём триггер...");
        await new Promise(r => setTimeout(r, 1500));
        
        const { data: retryData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (!retryData) {
          // Создаём профиль вручную если триггер не сработал
          console.log("📝 Создаём профиль вручную...");
          const { error: insertError } = await supabase.from("profiles").insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0],
            is_admin: authUser.email === "amksim.coder@gmail.com",
          });
          
          if (insertError) {
            console.error("❌ Ошибка создания профиля:", insertError);
          }
          
          // Возвращаем базовый профиль
          return {
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.email?.split("@")[0] || "User",
            is_admin: authUser.email === "amksim.coder@gmail.com",
            subscription_status: "free",
            paid_courses: [],
            created_at: new Date().toISOString(),
            hasPaid: false,
            paidCourses: [],
            completedLessons: [],
            progress: 0,
          };
        }

        return mapProfile(retryData, authUser);
      }

      return mapProfile(data, authUser);
    } catch (err) {
      console.error("❌ Ошибка загрузки профиля:", err);
      return null;
    }
  }

  function mapProfile(data: any, authUser: SupabaseUser): User {
    const paidCourses = data.paid_courses || [];
    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name || authUser.email?.split("@")[0] || "User",
      is_admin: data.is_admin || data.email === "amksim.coder@gmail.com",
      subscription_status: data.subscription_status || "free",
      paid_courses: paidCourses,
      created_at: data.created_at,
      // Для совместимости
      hasPaid: data.subscription_status === "premium" || paidCourses.length > 0,
      paidCourses: paidCourses,
      completedLessons: [],
      progress: 0,
    };
  }

  async function refreshUser() {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      const profile = await loadProfile(currentSession.user);
      setUser(profile);
      setSession(currentSession);
    }
  }

  // Инициализация
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user && mounted) {
          setSession(currentSession);
          const profile = await loadProfile(currentSession.user);
          setUser(profile);
        }
      } catch (err) {
        console.error("❌ Ошибка инициализации:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("🔔 Auth event:", event);
        
        if (event === "SIGNED_IN" && newSession?.user) {
          setSession(newSession);
          const profile = await loadProfile(newSession.user);
          if (mounted) setUser(profile);
        } else if (event === "SIGNED_OUT") {
          if (mounted) {
            setUser(null);
            setSession(null);
          }
        }
        
        if (mounted) setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ========================================
  // РЕГИСТРАЦИЯ
  // ========================================
  async function signUp(email: string, password: string, name?: string): Promise<{ error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name || email.split("@")[0] },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          return { error: "Этот email уже зарегистрирован" };
        }
        return { error: error.message };
      }

      if (data.user && !data.session) {
        return { error: "Проверьте почту для подтверждения" };
      }

      return {};
    } catch (err: any) {
      return { error: err.message || "Ошибка регистрации" };
    }
  }

  // ========================================
  // ВХОД
  // ========================================
  async function signIn(email: string, password: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login")) {
          return { error: "Неверный email или пароль" };
        }
        if (error.message.includes("Email not confirmed")) {
          return { error: "Подтвердите email (проверьте почту)" };
        }
        return { error: error.message };
      }

      return {};
    } catch (err: any) {
      return { error: err.message || "Ошибка входа" };
    }
  }

  // ========================================
  // ВЫХОД
  // ========================================
  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }

  // ========================================
  // ОБНОВЛЕНИЕ ПРОФИЛЯ
  // ========================================
  async function updateProfile(updates: { full_name?: string }) {
    if (!user) return;
    
    await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    
    await refreshUser();
  }

  // Алиасы для совместимости со старым кодом
  const login = async (email: string, password: string) => {
    const result = await signIn(email, password);
    return { success: !result.error, error: result.error };
  };

  const signup = async (email: string, password: string, name?: string) => {
    const result = await signUp(email, password, name);
    return { success: !result.error, error: result.error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin: user?.is_admin || false,
        signUp,
        signIn,
        signOut,
        refreshUser,
        // Алиасы
        loading: isLoading,
        logout: signOut,
        login,
        signup,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ========================================
// ХУК
// ========================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
