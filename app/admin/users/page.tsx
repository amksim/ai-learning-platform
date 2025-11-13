"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Send, Mail, Calendar, Trophy } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  telegram_username: string | null;
  subscription_status: string;
  created_at: string;
  progress: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const ADMIN_PASSWORD = "admin123"; // В продакшене лучше использовать env переменную

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      loadUsers();
    } else {
      alert("Неверный пароль!");
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Загружаем профили
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Для каждого профиля загружаем прогресс
      const usersWithProgress = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', profile.id)
            .eq('completed', true);

          return {
            ...profile,
            progress: progressData?.length || 0,
          };
        })
      );

      setUsers(usersWithProgress);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-purple-500/5">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">🔐 Админ-панель</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="text-sm font-medium">
                  Пароль администратора
                </label>
                <input
                  id="password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  placeholder="Введите пароль"
                  className="w-full mt-1 px-4 py-2 rounded-md border border-input bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                onClick={handleAdminLogin}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-md font-medium transition-colors"
              >
                Войти
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-background to-purple-500/5">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Админ-панель
            </span>
          </h1>
          <p className="text-gray-400">Управление пользователями</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glass border-2 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Всего пользователей</p>
                  <p className="text-3xl font-bold text-purple-400">{users.length}</p>
                </div>
                <Users className="h-10 w-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-2 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">С Telegram</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {users.filter(u => u.telegram_username).length}
                  </p>
                </div>
                <Send className="h-10 w-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-2 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Premium</p>
                  <p className="text-3xl font-bold text-purple-400">
                    {users.filter(u => u.subscription_status === 'premium').length}
                  </p>
                </div>
                <Trophy className="h-10 w-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="glass border-2 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Список пользователей ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/20">
                    <th className="text-left p-3 text-sm font-medium text-gray-400">Имя</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-400">Email</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-400">Telegram</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-400">Статус</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-400">Прогресс</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-400">Регистрация</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors">
                      <td className="p-3">
                        <div className="font-medium text-white">
                          {user.full_name || 'Без имени'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="p-3">
                        {user.telegram_username ? (
                          <a
                            href={`https://t.me/${user.telegram_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <Send className="h-4 w-4" />
                            @{user.telegram_username}
                          </a>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.subscription_status === 'premium'
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {user.subscription_status === 'premium' ? '👑 Premium' : 'Free'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-purple-400 font-medium">
                          {user.progress} уроков
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="h-4 w-4" />
                          {new Date(user.created_at).toLocaleDateString('ru-RU')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Telegram Contacts Export */}
        <div className="mt-4">
          <button
            onClick={() => {
              const telegramUsers = users
                .filter(u => u.telegram_username)
                .map(u => `@${u.telegram_username} - ${u.full_name || u.email}`)
                .join('\n');
              
              navigator.clipboard.writeText(telegramUsers);
              alert('Telegram контакты скопированы в буфер обмена!');
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Скопировать все Telegram
          </button>
        </div>
      </div>
    </div>
  );
}
