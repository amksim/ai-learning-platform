"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, Eye, EyeOff, Loader2, ArrowLeft, Check, KeyRound, User, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type Step = 'email' | 'code' | 'register' | 'password' | 'reset';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  
  // Шаг формы
  const [step, setStep] = useState<Step>('email');
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Данные формы
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Согласия
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  
  // Состояние
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [forceShowForm, setForceShowForm] = useState(false);
  
  // Refs для полей кода
  const codeInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Таймаут проверки сессии
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setForceShowForm(true);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Редирект если залогинен
  useEffect(() => {
    if (!isLoading && user) {
      window.location.href = "/courses";
    }
  }, [user, isLoading]);

  // Обратный отсчёт для повторной отправки кода
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Загрузка
  if (isLoading && !forceShowForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Шаг 1: Отправка кода на email
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Проверяем существует ли пользователь
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      setIsNewUser(!existingUser);

      // Отправляем OTP код
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(),
        options: {
          shouldCreateUser: true, // Создавать пользователя если не существует
        }
      });

      if (error) throw error;

      setSuccess("Код отправлен на вашу почту!");
      setStep('code');
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || "Ошибка отправки кода");
    } finally {
      setLoading(false);
    }
  }

  // Обработка ввода кода
  function handleCodeChange(index: number, value: string) {
    if (value.length > 1) {
      // Вставка нескольких цифр (копипаст)
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < 6) newCode[index + i] = digit;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      codeInputs.current[nextIndex]?.focus();
    } else {
      const newCode = [...code];
      newCode[index] = value.replace(/\D/g, '');
      setCode(newCode);
      if (value && index < 5) {
        codeInputs.current[index + 1]?.focus();
      }
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  }

  // Шаг 2: Проверка кода
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const otpCode = code.join('');
    if (otpCode.length !== 6) {
      setError("Введите полный код");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.toLowerCase(),
        token: otpCode,
        type: 'email'
      });

      if (error) throw error;

      if (isNewUser) {
        // Новый пользователь - переходим к регистрации
        setStep('register');
      } else {
        // Существующий пользователь - вводит пароль
        setStep('password');
      }
    } catch (err: any) {
      setError("Неверный код. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  // Шаг 3a: Завершение регистрации нового пользователя
  async function handleCompleteRegistration(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Валидация
    if (!name.trim()) {
      setError("Введите имя");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("Необходимо принять условия использования");
      return;
    }

    setLoading(true);

    try {
      // Обновляем пароль пользователя
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // Обновляем профиль
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        await supabase.from('profiles').upsert({
          id: currentUser.id,
          email: email.toLowerCase(),
          full_name: name.trim(),
          subscription_status: 'free',
          updated_at: new Date().toISOString()
        });
      }

      setSuccess("Регистрация завершена!");
      setTimeout(() => {
        window.location.href = "/courses";
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Ошибка регистрации");
      setLoading(false);
    }
  }

  // Шаг 3b: Вход существующего пользователя
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Пользователь уже авторизован через OTP, просто проверяем пароль
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password
      });

      if (error) {
        if (error.message.includes('Invalid login')) {
          setError("Неверный пароль");
        } else {
          throw error;
        }
        setLoading(false);
        return;
      }

      setSuccess("Вход выполнен!");
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/courses';
      localStorage.removeItem('redirectAfterLogin');
      
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);
    } catch (err: any) {
      setError(err.message || "Ошибка входа");
      setLoading(false);
    }
  }

  // Сброс пароля
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess("Пароль обновлён!");
      setTimeout(() => {
        window.location.href = "/courses";
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Ошибка сброса пароля");
      setLoading(false);
    }
  }

  // Повторная отправка кода
  async function handleResendCode() {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase(),
      });
      if (error) throw error;
      setSuccess("Код отправлен повторно!");
      setCountdown(60);
    } catch (err: any) {
      setError("Ошибка отправки кода");
    } finally {
      setLoading(false);
    }
  }

  // Назад
  function goBack() {
    setError("");
    setSuccess("");
    if (step === 'code') {
      setStep('email');
      setCode(["", "", "", "", "", ""]);
    } else if (step === 'register' || step === 'password') {
      setStep('code');
    } else if (step === 'reset') {
      setStep('password');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {step !== 'email' && (
            <button 
              onClick={goBack}
              className="absolute left-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            {step === 'email' && <Mail className="h-6 w-6 text-purple-500" />}
            {step === 'code' && <KeyRound className="h-6 w-6 text-purple-500" />}
            {step === 'register' && <User className="h-6 w-6 text-purple-500" />}
            {step === 'password' && <Shield className="h-6 w-6 text-purple-500" />}
            {step === 'reset' && <KeyRound className="h-6 w-6 text-purple-500" />}
          </div>
          
          <CardTitle className="text-2xl">
            {step === 'email' && 'Вход / Регистрация'}
            {step === 'code' && 'Введите код'}
            {step === 'register' && 'Завершите регистрацию'}
            {step === 'password' && 'Введите пароль'}
            {step === 'reset' && 'Новый пароль'}
          </CardTitle>
          
          <CardDescription>
            {step === 'email' && 'Введите email для получения кода'}
            {step === 'code' && `Код отправлен на ${email}`}
            {step === 'register' && 'Заполните данные для создания аккаунта'}
            {step === 'password' && 'Введите пароль от вашего аккаунта'}
            {step === 'reset' && 'Придумайте новый пароль'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Шаг 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {error && <ErrorMessage message={error} />}
              {success && <SuccessMessage message={success} />}

              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Получить код"}
              </Button>
            </form>
          )}

          {/* Шаг 2: Код */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { codeInputs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-400">
                    Отправить повторно через {countdown} сек
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-sm text-purple-400 hover:text-purple-300"
                    disabled={loading}
                  >
                    Отправить код повторно
                  </button>
                )}
              </div>

              {error && <ErrorMessage message={error} />}
              {success && <SuccessMessage message={success} />}

              <Button type="submit" className="w-full py-3" disabled={loading || code.join('').length !== 6}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Подтвердить"}
              </Button>
            </form>
          )}

          {/* Шаг 3a: Регистрация */}
          {step === 'register' && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Пароль</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    required
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

              <div>
                <label className="block text-sm font-medium mb-1">Повторите пароль</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Согласия */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-300">
                    Я принимаю <Link href="/terms" className="text-purple-400 hover:underline">условия использования</Link>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-300">
                    Я согласен с <Link href="/privacy" className="text-purple-400 hover:underline">политикой конфиденциальности</Link>
                  </span>
                </label>
              </div>

              {error && <ErrorMessage message={error} />}
              {success && <SuccessMessage message={success} />}

              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать аккаунт"}
              </Button>
            </form>
          )}

          {/* Шаг 3b: Ввод пароля */}
          {step === 'password' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Пароль</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    required
                    autoFocus
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

              <button
                type="button"
                onClick={() => setStep('reset')}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Забыли пароль? Сбросить
              </button>

              {error && <ErrorMessage message={error} />}
              {success && <SuccessMessage message={success} />}

              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Войти"}
              </Button>
            </form>
          )}

          {/* Шаг: Сброс пароля */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Новый пароль</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    required
                    autoFocus
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

              <div>
                <label className="block text-sm font-medium mb-1">Повторите пароль</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {error && <ErrorMessage message={error} />}
              {success && <SuccessMessage message={success} />}

              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить пароль"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
      {message}
    </div>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 text-sm flex items-center gap-2">
      <Check className="h-4 w-4" />
      {message}
    </div>
  );
}
