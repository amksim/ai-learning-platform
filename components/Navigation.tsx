"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, LogIn, LogOut, User, Settings, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { Language } from "@/lib/translations";

const languages = [
  { code: "ru" as Language, name: "Русский", flag: "🇷🇺" },
  { code: "en" as Language, name: "English", flag: "🇬🇧" },
  { code: "uk" as Language, name: "Українська", flag: "🇺🇦" },
  { code: "de" as Language, name: "Deutsch", flag: "🇩🇪" },
  { code: "pl" as Language, name: "Polski", flag: "🇵🇱" },
  { code: "nl" as Language, name: "Nederlands", flag: "🇳🇱" },
  { code: "ro" as Language, name: "Română", flag: "🇷🇴" },
  { code: "hu" as Language, name: "Magyar", flag: "🇭🇺" },
];

export function Navigation() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, loading } = useAuth();
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

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
            
            <div className="hidden md:flex items-center gap-1">
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
            {/* Language Dropdown - показываем на всех экранах */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                aria-label="Select language"
              >
                <span className="text-xl">{currentLanguage.flag}</span>
                <span className="hidden md:inline text-sm font-medium">{currentLanguage.name}</span>
                <ChevronDown className={`hidden md:block h-4 w-4 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isLanguageOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 max-h-[50vh] rounded-lg border border-border bg-card shadow-2xl overflow-hidden">
                  <div className="p-1 max-h-[calc(50vh-8px)] overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLanguageOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                          language === lang.code
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.name}</span>
                        {language === lang.code && (
                          <span className="ml-auto text-lg">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {loading && user ? (
              // Показываем загрузку ТОЛЬКО если пользователь уже есть
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : user ? (
              <>
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
