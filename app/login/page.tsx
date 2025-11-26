"use client";

// Отключаем статическую генерацию для этой страницы
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { signup, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          toast.error("Пароли не совпадают!");
          setLoading(false);
          return;
        }
        
        if (password.length < 6) {
          toast.error("Пароль должен быть минимум 6 символов");
          setLoading(false);
          return;
        }

        const result = await signup(email, password, name);
        
        if (!result.success) {
          toast.error(result.error || "Ошибка регистрации");
          setLoading(false);
          return;
        }
        
        toast.success("Добро пожаловать!");
      } else {
        const result = await login(email, password);
        
        if (!result.success) {
          toast.error(result.error || "Неверный email или пароль");
          setLoading(false);
          return;
        }
        
        toast.success("Вы вошли!");
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirectUrl);
      } else {
        router.push('/courses');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  }

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
                {isSignup ? "Создайте аккаунт для доступа к курсам" : "Войдите в свой аккаунт"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Имя (необязательно)</label>
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
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
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
                  <label htmlFor="password" className="text-sm font-medium">Пароль</label>
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
                {isSignup && (
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">Подтвердите пароль</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторите пароль"
                      required
                      minLength={6}
                      className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Загрузка..." : (
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
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setName("");
                    setConfirmPassword("");
                  }}
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
