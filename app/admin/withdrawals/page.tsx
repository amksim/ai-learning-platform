"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import WithdrawalsManager from "@/components/admin/WithdrawalsManager";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function WithdrawalsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Admin access protection
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push("/login");
      return;
    }

    // Проверяем что это админ
    if (user.email?.toLowerCase() !== "kmak4551@gmail.com") {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user || user.email?.toLowerCase() !== "kmak4551@gmail.com") {
    return null;
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-b from-background to-purple-500/5">
      <div className="container mx-auto max-w-7xl">
        {/* Заголовок с кнопкой назад */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад в админку
            </Button>
          </Link>
          
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
              💰 Управление выводами
            </span>
          </h1>
          <p className="text-gray-400">
            Обработка заявок на вывод средств из реферальной программы
          </p>
        </div>

        {/* Компонент управления */}
        <WithdrawalsManager />
      </div>
    </div>
  );
}
