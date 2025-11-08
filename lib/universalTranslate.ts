// Universal translation system for ALL content
// Using libre-translate free API (no API key needed)

// Language code mapping
const langCodeMap: Record<string, string> = {
  ru: 'ru',
  en: 'en',
  uk: 'uk',
  es: 'es',
  de: 'de',
  fr: 'fr',
  it: 'it',
  pt: 'pt',
  pl: 'pl',
  nl: 'nl',
  sv: 'sv',
  no: 'no',
  da: 'da',
  fi: 'fi',
  tr: 'tr',
  ar: 'ar',
  zh: 'zh-CN',
  ja: 'ja',
  ko: 'ko',
  hi: 'hi',
  th: 'th',
  vi: 'vi',
  id: 'id',
  ro: 'ro',
};

// Cache for translations to avoid repeated API calls
const translationCache: Record<string, string> = {};

/**
 * Универсальная функция перевода текста
 * @param text - текст для перевода
 * @param targetLang - целевой язык (ru, en, uk, etc.)
 * @param sourceLang - исходный язык (по умолчанию 'ru')
 * @returns переведенный текст
 */
export async function universalTranslate(
  text: string,
  targetLang: string,
  sourceLang: string = 'ru'
): Promise<string> {
  // Если язык тот же - возвращаем оригинал
  if (targetLang === sourceLang) {
    return text;
  }

  // Проверяем кэш
  const cacheKey = `${sourceLang}-${targetLang}-${text}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const targetCode = langCodeMap[targetLang] || targetLang;
    const sourceCode = langCodeMap[sourceLang] || sourceLang;
    
    // Используем бесплатное API LibreTranslate
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceCode,
        target: targetCode,
        format: 'text',
      }),
    });

    const data = await response.json();
    
    // Сохраняем в кэш
    if (data.translatedText) {
      translationCache[cacheKey] = data.translatedText;
      return data.translatedText;
    }
    
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    // В случае ошибки возвращаем оригинал
    return text;
  }
}

/**
 * Перевод объекта с контентом урока
 * @param lesson - урок с полями title, description, practiceDescription
 * @param targetLang - целевой язык
 * @returns объект с переведенными полями
 */
export async function translateLessonContent(
  lesson: {
    title: string;
    description: string;
    practiceDescription?: string;
  },
  targetLang: string
): Promise<{
  title: string;
  description: string;
  practiceDescription?: string;
}> {
  const [translatedTitle, translatedDescription, translatedPractice] = await Promise.all([
    universalTranslate(lesson.title, targetLang),
    universalTranslate(lesson.description, targetLang),
    lesson.practiceDescription
      ? universalTranslate(lesson.practiceDescription, targetLang)
      : Promise.resolve(undefined),
  ]);

  return {
    title: translatedTitle,
    description: translatedDescription,
    practiceDescription: translatedPractice,
  };
}

/**
 * Синхронная версия перевода (для клиента) - использует кэш или возвращает оригинал
 * @param text - текст для перевода
 * @param targetLang - целевой язык
 * @param sourceLang - исходный язык
 * @returns переведенный текст из кэша или оригинал
 */
export function translateSync(
  text: string,
  targetLang: string,
  sourceLang: string = 'ru'
): string {
  if (targetLang === sourceLang) {
    return text;
  }

  const cacheKey = `${sourceLang}-${targetLang}-${text}`;
  return translationCache[cacheKey] || text;
}

/**
 * Предзагрузка переводов для урока
 * Вызывается при загрузке страницы для подгрузки переводов в кэш
 */
export async function preloadLessonTranslations(
  lesson: {
    title: string;
    description: string;
    practiceDescription?: string;
  },
  languages: string[]
): Promise<void> {
  const promises: Promise<any>[] = [];

  for (const lang of languages) {
    if (lang !== 'ru') {
      promises.push(
        universalTranslate(lesson.title, lang),
        universalTranslate(lesson.description, lang)
      );
      
      if (lesson.practiceDescription) {
        promises.push(universalTranslate(lesson.practiceDescription, lang));
      }
    }
  }

  await Promise.all(promises);
}
