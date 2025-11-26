"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, User, Settings, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export function Navigation() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout, loading } = useAuth();

  const navItems = [
    { href: "/", label: t.nav.home },
    { href: "/courses", label: t.nav.courses },
    { href: "/projects", label: t.nav.projects },
  ];

  // Добавляем реферал для залогиненных пользователей
  const navItemsWithReferral = user ? [
    ...navItems,
    { href: "/referral", label: "Реферал", icon: DollarSign },
  ] : navItems;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-gray-900/95 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg group-hover:shadow-purple-500/50 transition-all group-hover:scale-110 neon-glow" />
              <span className="font-bold text-base sm:text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI Learning</span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-1">
              {navItemsWithReferral.map((item) => {
                const ItemIcon = 'icon' in item ? item.icon : null;
                const isReferral = item.href === "/referral";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                      pathname === item.href && "bg-accent text-accent-foreground",
                      isReferral && "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 hover:border-green-500/50 text-green-400"
                    )}
                  >
                    {ItemIcon && <ItemIcon className="h-4 w-4" />}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Переключатель языков */}
            <LanguageSwitcher />

            {loading ? (
              // Показываем загрузку + кнопку выхода на случай застрявшей сессии
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="hidden md:inline text-sm text-muted-foreground">Загрузка...</span>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    window.location.reload();
                  }}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  title="Выйти и сбросить"
                >
                  ✕
                </button>
              </div>
            ) : user ? (
              <>
                {/* Profile button - только на больших экранах */}
                <Link
                  href="/profile"
                  className={cn(
                    "hidden lg:flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors",
                    pathname === "/profile" && "bg-accent"
                  )}
                  title={t.nav.profile}
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">{t.nav.profile}</span>
                </Link>
                
                {/* Admin panel - only for specific email */}
                {user.email?.toLowerCase() === "kmak4551@gmail.com" && (
                  <Link
                    href="/admin"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors",
                      pathname === "/admin" && "bg-accent"
                    )}
                    title="Админ-панель"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden lg:inline text-sm">Админ</span>
                  </Link>
                )}
                {/* Logout button - показываем на всех экранах */}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                  title={t.nav.logout}
                >
                  <LogOut className="h-5 w-5 md:h-4 md:w-4" />
                  <span className="hidden md:inline text-sm">{t.nav.logout}</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span className="text-sm font-medium">{t.nav.login}</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}
