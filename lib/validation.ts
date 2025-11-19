/**
 * Утилиты для валидации данных
 */

/**
 * Проверка валидности email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Проверка силы пароля
 * Возвращает объект с оценкой силы и сообщениями
 */
export function checkPasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];

  // Минимальная длина
  if (password.length >= 8) {
    score++;
  } else {
    suggestions.push("Минимум 8 символов");
  }

  // Есть заглавные буквы
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    suggestions.push("Добавьте заглавные буквы");
  }

  // Есть строчные буквы
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    suggestions.push("Добавьте строчные буквы");
  }

  // Есть цифры
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    suggestions.push("Добавьте цифры");
  }

  // Есть спецсимволы
  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  }

  // Очень длинный пароль - бонус
  if (password.length >= 12) {
    score = Math.min(score + 1, 4);
  }

  // Определяем label и цвет
  let label = "";
  let color = "";

  switch (score) {
    case 0:
    case 1:
      label = "Слабый";
      color = "red";
      break;
    case 2:
      label = "Средний";
      color = "orange";
      break;
    case 3:
      label = "Хороший";
      color = "yellow";
      break;
    case 4:
    case 5:
      label = "Отличный";
      color = "green";
      break;
  }

  return { score, label, color, suggestions };
}

/**
 * Очистка и нормализация имени пользователя
 */
export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ') // Множественные пробелы в один
    .substring(0, 100); // Максимум 100 символов
}

/**
 * Очистка telegram username
 */
export function sanitizeTelegramUsername(username: string): string {
  return username
    .trim()
    .replace(/^@+/, '') // Убираем @ в начале
    .replace(/[^a-zA-Z0-9_]/g, '') // Только буквы, цифры и _
    .substring(0, 32); // Максимум 32 символа
}

/**
 * Проверка безопасности пароля - известные слабые пароли
 */
const commonPasswords = [
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'password123', '111111', 'admin', 'letmein', 'welcome'
];

export function isCommonPassword(password: string): boolean {
  return commonPasswords.includes(password.toLowerCase());
}

/**
 * Полная валидация регистрации
 */
export function validateSignupData(
  email: string,
  password: string,
  confirmPassword: string,
  name?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Email
  if (!email) {
    errors.push("Email обязателен");
  } else if (!isValidEmail(email)) {
    errors.push("Неверный формат email");
  }

  // Пароль
  if (!password) {
    errors.push("Пароль обязателен");
  } else {
    if (password.length < 6) {
      errors.push("Пароль должен содержать минимум 6 символов");
    }
    if (isCommonPassword(password)) {
      errors.push("Этот пароль слишком распространен, выберите другой");
    }
  }

  // Подтверждение пароля
  if (password !== confirmPassword) {
    errors.push("Пароли не совпадают");
  }

  // Имя (опционально)
  if (name && name.trim().length > 100) {
    errors.push("Имя слишком длинное (максимум 100 символов)");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Полная валидация входа
 */
export function validateLoginData(
  email: string,
  password: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!email) {
    errors.push("Email обязателен");
  } else if (!isValidEmail(email)) {
    errors.push("Неверный формат email");
  }

  if (!password) {
    errors.push("Пароль обязателен");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
