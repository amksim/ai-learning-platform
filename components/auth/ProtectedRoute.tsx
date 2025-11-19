"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * HOC для защиты роутов
 * 
 * @param requireAdmin - требуется ли admin доступ
 * @param redirectTo - куда редиректить если нет доступа
 * 
 * Использование:
 * <ProtectedRoute>
 *   <YourPage />
 * </ProtectedRoute>
 * 
 * Или с admin:
 * <ProtectedRoute requireAdmin>
 *   <AdminPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  redirectTo = "/login"
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Не проверяем пока идет загрузка
    if (loading) return;

    // Если нет пользователя - редирект на login
    if (!user) {
      console.log('🔒 Доступ запрещен: пользователь не авторизован');
      // Сохраняем URL для редиректа после входа
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.push(redirectTo);
      return;
    }

    // Если требуется admin доступ
    if (requireAdmin) {
      const isAdmin = user.email?.toLowerCase() === "kmak4551@gmail.com";
      if (!isAdmin) {
        console.log('🔒 Доступ запрещен: требуются права администратора');
        router.push("/");
        return;
      }
    }

    console.log('✅ Доступ разрешен');
  }, [user, loading, requireAdmin, redirectTo, router]);

  // Показываем загрузку пока проверяем авторизацию
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // Не показываем контент пока не проверили доступ
  if (!user || (requireAdmin && user.email?.toLowerCase() !== "kmak4551@gmail.com")) {
    return null;
  }

  return <>{children}</>;
}
