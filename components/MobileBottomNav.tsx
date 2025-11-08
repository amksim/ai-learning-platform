"use client";

import { Home, BookOpen, FolderOpen, User, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: t.nav.home,
      isActive: pathname === "/",
      type: "link" as const,
    },
    {
      href: "/courses",
      icon: BookOpen,
      label: t.nav.courses,
      isActive: pathname.startsWith("/courses"),
      type: "link" as const,
    },
    {
      href: "/projects",
      icon: FolderOpen,
      label: t.nav.projects || "Проекты",
      isActive: pathname === "/projects",
      type: "link" as const,
    },
    {
      href: "https://t.me/AlLearning_Help",
      icon: MessageCircle,
      label: t.support?.button || "Поддержка",
      isActive: false,
      type: "support" as const,
    },
    {
      href: "/profile",
      icon: User,
      label: t.nav.profile,
      isActive: pathname === "/profile",
      type: "link" as const,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-gradient-to-t from-gray-900 via-gray-900/98 to-gray-900/95 backdrop-blur-xl border-t border-purple-500/20 shadow-2xl shadow-purple-500/10">
      <div className="flex items-center justify-around px-1 py-2 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSupport = item.type === "support";
          
          const className = cn(
            "relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[70px]",
            item.isActive
              ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-white scale-105"
              : isSupport
                ? "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 active:scale-95"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50 active:scale-95"
          );
          
          const content = (
            <>
              {/* Свечение для активного элемента */}
              {item.isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-md -z-10 animate-pulse" />
              )}
              
              {/* Свечение для поддержки */}
              {isSupport && (
                <div className="absolute inset-0 bg-cyan-500/10 rounded-xl blur-sm -z-10" />
              )}
              
              {/* Иконка с анимацией */}
              <div className="relative">
                <Icon
                  className={cn(
                    "h-6 w-6 transition-all duration-300",
                    item.isActive && "scale-110 drop-shadow-lg",
                    isSupport && "animate-pulse"
                  )}
                  strokeWidth={item.isActive ? 2.5 : 2}
                />
                {/* Индикатор активности */}
                {item.isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                )}
                {/* Индикатор онлайн для поддержки */}
                {isSupport && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />
                  </div>
                )}
              </div>
              
              {/* Текст */}
              <span 
                className={cn(
                  "text-xs font-medium transition-all duration-300",
                  item.isActive ? "font-bold" : "font-normal"
                )}
              >
                {item.label}
              </span>
              
              {/* Полоска снизу для активного */}
              {item.isActive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              )}
            </>
          );
          
          // Для поддержки используем button, для остальных Link
          return isSupport ? (
            <button
              key={item.href}
              onClick={() => window.open(item.href, "_blank", "noopener,noreferrer")}
              className={className}
            >
              {content}
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
