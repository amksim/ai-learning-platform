"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { signup, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignup) {
        // Sign up new user
        await signup(email, password, name || email.split('@')[0]);
        toast.success(`🎉 Добро пожаловать, ${name || email.split('@')[0]}!`, {
          duration: 3000,
        });
        // Wait for auth state to update
        setTimeout(() => {
          router.push("/courses");
        }, 500);
      } else {
        // Login existing user
        await login(email, password);
        toast.success("✅ Вы успешно вошли!", {
          duration: 2000,
        });
        setTimeout(() => {
          router.push("/courses");
        }, 500);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setLoading(false);
      
      if (error.message?.includes('already registered')) {
        toast.error("❌ Этот email уже зарегистрирован!\nПереключитесь на 'Вход'", {
          duration: 4000,
        });
        setTimeout(() => setIsSignup(false), 1000);
      } else if (error.message?.includes('Invalid login') || error.message?.includes('Invalid')) {
        toast.error("❌ Неверный email или пароль\nПопробуйте ещё раз", {
          duration: 4000,
        });
      } else if (error.message?.includes('security purposes')) {
        toast.error("⏱️ Слишком много попыток\nПодождите 1 минуту и попробуйте снова", {
          duration: 5000,
        });
      } else {
        toast.error(error.message || "Ошибка входа. Попробуйте позже.", {
          duration: 4000,
        });
      }
      return;
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-accent/10 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="space-y-1">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-center text-2xl">
                {isSignup ? "Регистрация" : "Вход"}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignup
                  ? "Создайте аккаунт для доступа к курсам"
                  : "Войдите в свой аккаунт"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Имя
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ваше имя"
                      className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Пароль
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    required
                    minLength={6}
                    className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    "Загрузка..."
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      {isSignup ? "Зарегистрироваться" : "Войти"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsSignup(!isSignup)}
                >
                  {isSignup ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
