"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { universalTranslate } from "@/lib/universalTranslate";

// Dictionary for translating common course terms
const translations: Record<string, Record<string, string>> = {
  // Course difficulty levels
  beginner: {
    en: "Beginner", es: "Principiante", de: "Anfänger", fr: "Débutant", it: "Principiante",
    pt: "Iniciante", nl: "Beginner", sv: "Nybörjare", no: "Nybegynner", da: "Begynder",
    fi: "Aloittelija", tr: "Başlangıç", ar: "مبتدئ", zh: "初学者", ja: "初心者",
    ko: "초급", hi: "शुरुआती", th: "ผู้เริ่มต้น", vi: "Người mới", id: "Pemula"
  },
  intermediate: {
    en: "Intermediate", es: "Intermedio", de: "Fortgeschritten", fr: "Intermédiaire", it: "Intermedio",
    pt: "Intermediário", nl: "Gevorderd", sv: "Medel", no: "Middels", da: "Mellem",
    fi: "Keskitaso", tr: "Orta", ar: "متوسط", zh: "中级", ja: "中級",
    ko: "중급", hi: "मध्यम", th: "ระดับกลาง", vi: "Trung cấp", id: "Menengah"
  },
  advanced: {
    en: "Advanced", es: "Avanzado", de: "Experte", fr: "Avancé", it: "Avanzato",
    pt: "Avançado", nl: "Gevorderd", sv: "Avancerad", no: "Avansert", da: "Avanceret",
    fi: "Edistynyt", tr: "İleri", ar: "متقدم", zh: "高级", ja: "上級",
    ko: "고급", hi: "उन्नत", th: "ขั้นสูง", vi: "Nâng cao", id: "Lanjutan"
  },
  
  // Categories
  foundation: {
    en: "Foundation", es: "Fundamentos", de: "Grundlagen", fr: "Fondamentaux", it: "Fondamenti",
    pt: "Fundamentos", nl: "Basis", sv: "Grund", no: "Grunnlag", da: "Grundlag",
    fi: "Perusteet", tr: "Temel", ar: "الأساسيات", zh: "基础", ja: "基礎",
    ko: "기초", hi: "नींव", th: "พื้นฐาน", vi: "Nền tảng", id: "Dasar"
  },
  html: {
    en: "HTML", es: "HTML", de: "HTML", fr: "HTML", it: "HTML",
    pt: "HTML", nl: "HTML", sv: "HTML", no: "HTML", da: "HTML",
    fi: "HTML", tr: "HTML", ar: "HTML", zh: "HTML", ja: "HTML",
    ko: "HTML", hi: "HTML", th: "HTML", vi: "HTML", id: "HTML"
  },
  css: {
    en: "CSS", es: "CSS", de: "CSS", fr: "CSS", it: "CSS",
    pt: "CSS", nl: "CSS", sv: "CSS", no: "CSS", da: "CSS",
    fi: "CSS", tr: "CSS", ar: "CSS", zh: "CSS", ja: "CSS",
    ko: "CSS", hi: "CSS", th: "CSS", vi: "CSS", id: "CSS"
  },
  javascript: {
    en: "JavaScript", es: "JavaScript", de: "JavaScript", fr: "JavaScript", it: "JavaScript",
    pt: "JavaScript", nl: "JavaScript", sv: "JavaScript", no: "JavaScript", da: "JavaScript",
    fi: "JavaScript", tr: "JavaScript", ar: "JavaScript", zh: "JavaScript", ja: "JavaScript",
    ko: "JavaScript", hi: "JavaScript", th: "JavaScript", vi: "JavaScript", id: "JavaScript"
  },
  games: {
    en: "Games", es: "Juegos", de: "Spiele", fr: "Jeux", it: "Giochi",
    pt: "Jogos", nl: "Spellen", sv: "Spel", no: "Spill", da: "Spil",
    fi: "Pelit", tr: "Oyunlar", ar: "ألعاب", zh: "游戏", ja: "ゲーム",
    ko: "게임", hi: "खेल", th: "เกม", vi: "Trò chơi", id: "Game"
  },
  websites: {
    en: "Websites", es: "Sitios web", de: "Webseiten", fr: "Sites web", it: "Siti web",
    pt: "Sites", nl: "Websites", sv: "Webbplatser", no: "Nettsteder", da: "Hjemmesider",
    fi: "Verkkosivustot", tr: "Web siteleri", ar: "مواقع", zh: "网站", ja: "ウェブサイト",
    ko: "웹사이트", hi: "वेबसाइट", th: "เว็บไซต์", vi: "Website", id: "Website"
  },
  apps: {
    en: "Apps", es: "Aplicaciones", de: "Apps", fr: "Applications", it: "Applicazioni",
    pt: "Aplicativos", nl: "Apps", sv: "Appar", no: "Apper", da: "Apps",
    fi: "Sovellukset", tr: "Uygulamalar", ar: "تطبيقات", zh: "应用", ja: "アプリ",
    ko: "앱", hi: "ऐप्स", th: "แอพ", vi: "Ứng dụng", id: "Aplikasi"
  },
};

// Hook to translate any text
export function useTranslate() {
  const { language } = useLanguage();
  
  const translate = (text: string): string => {
    if (!text || language === "ru" || language === "uk") return text;
    
    // Try to find exact match in translations
    const lowerText = text.toLowerCase();
    if (translations[lowerText] && translations[lowerText][language]) {
      return translations[lowerText][language];
    }
    
    // Return original if no translation found
    return text;
  };
  
  return { translate, language };
}
