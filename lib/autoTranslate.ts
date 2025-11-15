// Auto-translation utility for dynamic content
// Maps Russian text to other languages

export const languageNames: Record<string, string> = {
  ru: "Русский",
  en: "English",
  uk: "Українська",
  de: "Deutsch",
  pl: "Polski",
  nl: "Nederlands",
  ro: "Română",
  hu: "Magyar",
};

// Simple translation map for common course-related terms
const translationMap: Record<string, Record<string, string>> = {
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
  pl: {
    "Урок": "Lekcja",
    "Описание": "Opis",
    "Практика": "Praktyka",
    "Задание": "Zadanie",
    "Бесплатный": "Darmowy",
    "Платный": "Płatny",
    "Начальный": "Początkujący",
    "Средний": "Średniozaawansowany",
    "Продвинутый": "Zaawansowany",
  },
  nl: {
    "Урок": "Les",
    "Описание": "Beschrijving",
    "Практика": "Praktijk",
    "Задание": "Taak",
    "Бесплатный": "Gratis",
    "Платный": "Betaald",
    "Начальный": "Beginner",
    "Средний": "Gemiddeld",
    "Продвинутый": "Gevorderd",
  },
  ro: {
    "Урок": "Lecție",
    "Описание": "Descriere",
    "Практика": "Practică",
    "Задание": "Sarcină",
    "Бесплатный": "Gratuit",
    "Платный": "Plătit",
    "Начальный": "Începător",
    "Средний": "Intermediar",
    "Продвинутый": "Avansat",
  },
  hu: {
    "Урок": "Lekció",
    "Описание": "Leírás",
    "Практика": "Gyakorlat",
    "Задание": "Feladat",
    "Бесплатный": "Ingyenes",
    "Платный": "Fizetős",
    "Начальный": "Kezdő",
    "Средний": "Középhaladó",
    "Продвинутый": "Haladó",
  },
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
