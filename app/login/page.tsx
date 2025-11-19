"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, AlertCircle, CheckCircle, Info } from "lucide-react";
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
  const [telegramUsername, setTelegramUsername] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          toast.error(
            (t) => (
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Пароли не совпадают!</p>
                  <p className="text-sm opacity-90">Проверьте оба поля пароля</p>
                </div>
              </div>
            ),
            {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#fff',
                padding: '16px',
              },
            }
          );
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          toast.error(
            (t) => (
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Пароль слишком короткий</p>
                  <p className="text-sm opacity-90">Минимум 6 символов</p>
                </div>
              </div>
            ),
            {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#fff',
                padding: '16px',
              },
            }
          );
          setLoading(false);
          return;
        }
        await signup(email, password, name, telegramUsername || undefined);
        toast.success(
          (t) => (
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Добро пожаловать, {name}!</p>
                <p className="text-sm opacity-90">Регистрация прошла успешно</p>
              </div>
            </div>
          ),
          {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
              padding: '16px',
            },
          }
        );
      } else {
        await login(email, password);
        toast.success(
          (t) => (
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Вы вошли!</p>
                <p className="text-sm opacity-90">Перенаправление на курсы...</p>
              </div>
            </div>
          ),
          {
            duration: 2000,
            style: {
              background: '#10b981',
              color: '#fff',
              padding: '16px',
            },
          }
        );
      }

      // Перенаправление - проверяем есть ли сохраненный URL
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectUrl;
      } else {
        window.location.href = '/courses';
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Специальная обработка для дубликатов email
      if (error.message?.includes('already') || 
          error.message?.includes('registered') ||
          error.message?.includes('duplicate') ||
          error.message?.includes('существует')) {
        toast.error(
          (t) => (
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Email уже зарегистрирован</p>
                <p className="text-sm opacity-90">Используйте кнопку 'Войти' ниже</p>
              </div>
            </div>
          ),
          {
            duration: 5000,
            style: {
              background: '#ef4444',
              color: '#fff',
              padding: '16px',
            },
          }
        );
        // Автоматически переключаем на вход
        setTimeout(() => {
          setIsSignup(false);
          setPassword(''); // Очищаем пароль для безопасности
        }, 1500);
      } else if (error.message?.includes('Invalid login') || error.message?.includes('Invalid')) {
        toast.error(
          (t) => (
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Неверный email или пароль</p>
                <p className="text-sm opacity-90">Проверьте данные и попробуйте ещё раз</p>
              </div>
            </div>
          ),
          {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
              padding: '16px',
            },
          }
        );
      } else if (error.message?.includes('security purposes') || error.message?.includes('rate limit')) {
        toast.error(
          (t) => (
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Слишком много попыток</p>
                <p className="text-sm opacity-90">Подождите 1 минуту и попробуйте снова</p>
              </div>
            </div>
          ),
          {
            duration: 5000,
            style: {
              background: '#f59e0b',
              color: '#fff',
              padding: '16px',
            },
          }
        );
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error(
          (t) => (
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Подтвердите email</p>
                <p className="text-sm opacity-90">Проверьте почту и подтвердите регистрацию</p>
              </div>
            </div>
          ),
          {
            duration: 6000,
            style: {
              background: '#3b82f6',
              color: '#fff',
              padding: '16px',
            },
          }
        );
      } else if (error.message?.includes('User not found') || error.message?.includes('not found')) {
        toast.error(
          (t) => (
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Пользователь не найден</p>
                <p className="text-sm opacity-90">Проверьте email или зарегистрируйтесь</p>
              </div>
            </div>
          ),
          {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
              padding: '16px',
            },
          }
        );
      } else {
        toast.error(
          (t) => (
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Произошла ошибка</p>
                <p className="text-sm opacity-90">{error.message || "Попробуйте позже"}</p>
              </div>
            </div>
          ),
          {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
              padding: '16px',
            },
          }
        );
      }
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
                {isSignup
                  ? "Создайте аккаунт для доступа к курсам"
                  : "Войдите в свой аккаунт"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Имя (необязательно)
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ваше имя"
                        className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <p className="text-xs text-muted-foreground">
                        Если не указано, будет использован email
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="telegram" className="text-sm font-medium">
                        Telegram (необязательно)
                      </label>
                      <input
                        id="telegram"
                        type="text"
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value.replace('@', ''))}
                        placeholder="username (без @)"
                        className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <p className="text-xs text-muted-foreground">
                        Для связи и поддержки
                      </p>
                    </div>
                  </>
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
                {isSignup && (
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Подтвердите пароль
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Повторите пароль"
                      required={isSignup}
                      minLength={6}
                      className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}
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
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setName("");
                    setTelegramUsername("");
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
