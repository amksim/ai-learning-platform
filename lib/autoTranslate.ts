// Auto-translation utility for dynamic content
// Maps Russian text to other languages

export const languageNames: Record<string, string> = {
  ru: "Русский",
  en: "English",
  uk: "Українська",
  es: "Español",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  pt: "Português",
  pl: "Polski",
  nl: "Nederlands",
  sv: "Svenska",
  no: "Norsk",
  da: "Dansk",
  fi: "Suomi",
  tr: "Türkçe",
  ar: "العربية",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  hi: "हिन्दी",
  th: "ไทย",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia",
  ro: "Română",
};

// Simple translation map for common course-related terms
const translationMap: Record<string, Record<string, string>> = {
  // English
  en: {
    "Урок": "Lesson",
    "Описание": "Description",
    "Практика": "Practice",
    "Задание": "Task",
    "Бесплатный": "Free",
    "Платный": "Paid",
    "Начальный": "Beginner",
    "Средний": "Intermediate",
    "Продвинутый": "Advanced",
  },
  // Spanish
  es: {
    "Урок": "Lección",
    "Описание": "Descripción",
    "Практика": "Práctica",
    "Задание": "Tarea",
    "Бесплатный": "Gratis",
    "Платный": "Pagado",
    "Начальный": "Principiante",
    "Средний": "Intermedio",
    "Продвинутый": "Avanzado",
  },
  // German
  de: {
    "Урок": "Lektion",
    "Описание": "Beschreibung",
    "Практика": "Praxis",
    "Задание": "Aufgabe",
    "Бесплатный": "Kostenlos",
    "Платный": "Bezahlt",
    "Начальный": "Anfänger",
    "Средний": "Fortgeschritten",
    "Продвинутый": "Experte",
  },
  // French
  fr: {
    "Урок": "Leçon",
    "Описание": "Description",
    "Практика": "Pratique",
    "Задание": "Tâche",
    "Бесплатный": "Gratuit",
    "Платный": "Payant",
    "Начальный": "Débutant",
    "Средний": "Intermédiaire",
    "Продвинутый": "Avancé",
  },
  // Add more as needed - this is just for basic terms
};

// Auto-translate function - keeps original if translation not available
export function autoTranslate(text: string, targetLang: string): string {
  if (targetLang === "ru") return text;
  
  const map = translationMap[targetLang];
  if (!map) return text;
  
  // Try to find translation
  for (const [ru, translated] of Object.entries(map)) {
    text = text.replace(new RegExp(ru, 'gi'), translated);
  }
  
  return text;
}
