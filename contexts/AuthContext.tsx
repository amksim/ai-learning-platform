"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  email: string;
  progress: number; // Единый прогресс для всех уровней
  joinedDate: string; // Дата регистрации
  hasPaid: boolean; // Оплач ли курс
  registeredAt: number; // Время регистрации для таймера скидки
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  updateProgress: (level: number) => void;
  completePurchase: () => void; // Обработка успешной покупки
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Для старых пользователей без joinedDate добавляем дату
      if (!parsed.joinedDate) {
        parsed.joinedDate = new Date().toISOString();
      }
      // Добавляем недостающие поля для старых пользователей
      if (parsed.hasPaid === undefined) {
        parsed.hasPaid = false;
      }
      if (parsed.registeredAt === undefined) {
        parsed.registeredAt = Date.now();
      }
      // Исправляем некорректный прогресс
      if (typeof parsed.progress !== 'number' || isNaN(parsed.progress)) {
        parsed.progress = 0;
      }
      setUser(parsed);
      localStorage.setItem("user", JSON.stringify(parsed));
    }
  }, []);

  const login = (email: string) => {
    const newUser: User = {
      email,
      progress: 0,
      joinedDate: new Date().toISOString(),
      hasPaid: false,
      registeredAt: Date.now(),
    };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateProgress = (level: number) => {
    if (user && level > user.progress) {
      const updatedUser = { ...user, progress: level };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const completePurchase = () => {
    if (user) {
      const updatedUser = { ...user, hasPaid: true };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      // Сохраняем информацию о покупке отдельно
      const purchase = {
        email: user.email,
        purchasedAt: Date.now(),
        amount: 100,
        currency: 'USD'
      };
      localStorage.setItem("purchase", JSON.stringify(purchase));
    }
  };

  // Обновляем общее количество уровней
  const TOTAL_LEVELS = 220;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProgress, completePurchase }}>
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
