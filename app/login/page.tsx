"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, signIn, signUp } = useAuth();
  
  // Все useState должны быть до любых условных return
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forceShowForm, setForceShowForm] = useState(false);

  // Принудительный таймаут - если 3 секунды загрузка, показываем форму
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('⏰ Таймаут проверки сессии на странице логина');
        setForceShowForm(true);
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Редирект если уже залогинен
  useEffect(() => {
    if (!isLoading && user) {
      console.log('✅ Пользователь залогинен, редирект на /courses');
      window.location.href = "/courses"; // Принудительный редирект
    }
  }, [user, isLoading]);

  // Показываем загрузку пока проверяем сессию (но не больше 3 сек)
  if (isLoading && !forceShowForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Проверка сессии...</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Валидация
        if (password.length < 6) {
          setError("Пароль должен быть минимум 6 символов");
          setLoading(false);
          return;
        }

        const result = await signUp(email, password, name);
        
        if (result.error) {
          if (result.error.includes("почту")) {
            setSuccess(result.error);
          } else {
            setError(result.error);
          }
          setLoading(false);
          return;
        }

        setSuccess("Регистрация успешна!");
        setTimeout(() => {
          window.location.href = "/courses";
        }, 1000);
        return; // Не сбрасываем loading
      } else {
        const result = await signIn(email, password);
        
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        // Успешный вход - делаем принудительный редирект
        setSuccess("Вход выполнен!");
        
        // Проверяем сохранённый редирект
        const redirectPath = typeof window !== 'undefined' 
          ? localStorage.getItem('redirectAfterLogin') || '/courses'
          : '/courses';
        localStorage.removeItem('redirectAfterLogin');
        
        // Используем window.location для надёжного редиректа
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 300);
        return; // Не сбрасываем loading - уходим со страницы
      }
    } catch (err: any) {
      setError(err.message || "Произошла ошибка");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Mail className="h-6 w-6 text-purple-500" />
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? "Регистрация" : "Вход"}
          </CardTitle>
          <CardDescription>
            {isSignUp ? "Создайте аккаунт" : "Войдите в аккаунт"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Имя (только при регистрации) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium mb-1">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Пароль */}
            <div>
              <label className="block text-sm font-medium mb-1">Пароль</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Ошибка */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Успех */}
            {success && (
              <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 text-sm">
                {success}
              </div>
            )}

            {/* Кнопка */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignUp ? (
                "Зарегистрироваться"
              ) : (
                "Войти"
              )}
            </Button>

            {/* Переключатель */}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccess("");
              }}
              className="w-full text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isSignUp ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
