// Auto-translate course content to all languages
// This is a simple translation utility. For production, use a real translation API.

export interface TranslatedContent {
  title: string;
  description: string;
  videoUrl?: string; // URL видео на этом языке (опционально)
}

// Simple translation dictionary for common course terms
const translations: Record<string, Record<string, string>> = {
  // Common words
  "Урок": {
    en: "Lesson", es: "Lección", de: "Lektion", fr: "Leçon", it: "Lezione",
    pt: "Lição", pl: "Lekcja", nl: "Les", sv: "Lektion", no: "Leksjon",
    da: "Lektion", fi: "Oppitunti", tr: "Ders", ar: "درس", zh: "课程",
    ja: "レッスン", ko: "수업", hi: "पाठ", th: "บทเรียน", vi: "Bài học", id: "Pelajaran"
  },
  "Введение": {
    en: "Introduction", es: "Introducción", de: "Einführung", fr: "Introduction", it: "Introduzione",
    pt: "Introdução", pl: "Wprowadzenie", nl: "Inleiding", sv: "Introduktion", no: "Introduksjon",
    da: "Introduktion", fi: "Johdanto", tr: "Giriş", ar: "مقدمة", zh: "介绍",
    ja: "紹介", ko: "소개", hi: "परिचय", th: "บทนำ", vi: "Giới thiệu", id: "Pengenalan"
  },
  "Основы": {
    en: "Basics", es: "Básicos", de: "Grundlagen", fr: "Bases", it: "Basi",
    pt: "Básico", pl: "Podstawy", nl: "Basis", sv: "Grunder", no: "Grunnleggende",
    da: "Grundlæggende", fi: "Perusteet", tr: "Temel", ar: "الأساسيات", zh: "基础",
    ja: "基本", ko: "기초", hi: "मूल बातें", th: "พื้นฐาน", vi: "Cơ bản", id: "Dasar"
  },
  "Практика": {
    en: "Practice", es: "Práctica", de: "Praxis", fr: "Pratique", it: "Pratica",
    pt: "Prática", pl: "Praktyka", nl: "Praktijk", sv: "Praktik", no: "Praksis",
    da: "Praksis", fi: "Harjoitus", tr: "Pratik", ar: "ممارسة", zh: "实践",
    ja: "練習", ko: "연습", hi: "अभ्यास", th: "ปฏิบัติ", vi: "Thực hành", id: "Praktek"
  },
};

// Supported languages
const supportedLanguages = ["en", "uk", "es", "de", "fr", "it", "pt", "pl", "nl", "sv", "no", "da", "fi", "tr", "ar", "zh", "ja", "ko", "hi", "th", "vi", "id", "ro"];

// Translate a single text
function translateText(text: string, targetLang: string): string {
  if (targetLang === "ru") return text;
  
  // Try to find exact matches in dictionary
  for (const [ru, langTranslations] of Object.entries(translations)) {
    if (text.includes(ru)) {
      text = text.replace(new RegExp(ru, 'g'), langTranslations[targetLang] || ru);
    }
  }
  
  return text;
}

// Auto-translate course content to all languages
export function autoTranslateCourseContent(
  russianTitle: string,
  russianDescription: string,
  existingTranslations?: Record<string, TranslatedContent>
): Record<string, TranslatedContent> {
  const result: Record<string, TranslatedContent> = {
    ru: {
      title: russianTitle,
      description: russianDescription,
      // Сохраняем существующий videoUrl если есть
      videoUrl: existingTranslations?.ru?.videoUrl,
    },
  };

  // Add Ukrainian (same as Russian for now)
  result.uk = {
    title: russianTitle,
    description: russianDescription,
    videoUrl: existingTranslations?.uk?.videoUrl,
  };

  // Translate to other languages
  supportedLanguages.forEach((lang) => {
    if (lang !== "uk") {
      result[lang] = {
        title: translateText(russianTitle, lang),
        description: translateText(russianDescription, lang),
        // Сохраняем существующий videoUrl если есть
        videoUrl: existingTranslations?.[lang]?.videoUrl,
      };
    }
  });

  return result;
}

// Get translated content for specific language
export function getTranslatedContent(
  translatedData: Record<string, TranslatedContent>,
  language: string
): TranslatedContent {
  // Return the requested language or fallback to Russian
  return translatedData[language] || translatedData.ru || {
    title: "Course",
    description: "Learn with AI",
  };
}
