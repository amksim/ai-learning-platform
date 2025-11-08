"use client";

import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SupportButton() {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();

  const TELEGRAM_LINK = "https://t.me/AlLearning_Help";

  const handleClick = () => {
    window.open(TELEGRAM_LINK, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-50">
      {/* Плавающая кнопка - ВСЕГДА ВИДИМЫЙ ТЕКСТ */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white font-bold rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/50"
        aria-label="Поддержка Telegram"
      >
        {/* Иконка Telegram с анимацией */}
        <div className="relative animate-bounce">
          <Send className="h-6 w-6 transform rotate-45" />
          {/* Пульсирующий круг */}
          <div className="absolute -inset-2 bg-blue-300 rounded-full opacity-40 animate-ping"></div>
        </div>

        {/* Текст - ВСЕГДА ВИДЕН */}
        <span className="text-base font-bold whitespace-nowrap">
          💬 {t.support?.button || "Поддержка"}
        </span>

        {/* Индикатор онлайн */}
        <div className="absolute -top-1 -right-1 flex items-center justify-center">
          <div className="relative">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Подсказка при наведении */}
        <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>{t.support?.description || "Напиши нам в Telegram, мы ответим в течение 5 минут!"}</span>
          </div>
          <div className="absolute top-full right-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      </button>

      {/* Декоративный эффект свечения */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full blur-2xl opacity-60 -z-10 animate-pulse"></div>
    </div>
  );
}
