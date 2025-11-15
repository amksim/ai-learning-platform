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
    en: "Lesson", uk: "Урок", de: "Lektion", pl: "Lekcja", nl: "Les", ro: "Lecție", hu: "Lekció"
  },
  "Введение": {
    en: "Introduction", uk: "Вступ", de: "Einführung", pl: "Wprowadzenie", nl: "Inleiding", ro: "Introducere", hu: "Bevezetés"
  },
  "Основы": {
    en: "Basics", uk: "Основи", de: "Grundlagen", pl: "Podstawy", nl: "Basis", ro: "Bazele", hu: "Alapok"
  },
  "Практика": {
    en: "Practice", uk: "Практика", de: "Praxis", pl: "Praktyka", nl: "Praktijk", ro: "Practică", hu: "Gyakorlat"
  },
};

// Supported languages - only 8 selected languages
const supportedLanguages = ["en", "uk", "de", "pl", "nl", "ro", "hu"];

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
