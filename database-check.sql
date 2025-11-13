-- ПРОВЕРКА БАЗЫ ДАННЫХ - ВЫПОЛНИ ЭТИ ЗАПРОСЫ В SUPABASE SQL EDITOR

-- ========================================
-- 1. ПРОВЕРКА ТАБЛИЦЫ PROFILES
-- ========================================

-- Проверяем структуру таблицы profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Проверяем индексы на profiles
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'profiles';

-- Проверяем политики RLS на profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Смотрим реальные данные пользователей
SELECT 
  id,
  email,
  full_name,
  telegram_username,
  subscription_status,
  created_at,
  updated_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- 2. ПРОВЕРКА ТАБЛИЦЫ USER_PROGRESS
-- ========================================

-- Проверяем структуру таблицы user_progress
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
ORDER BY ordinal_position;

-- Проверяем индексы на user_progress
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_progress';

-- ВАЖНО: Проверяем есть ли уникальный индекс на (user_id, lesson_index)
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_progress'
  AND indexdef LIKE '%UNIQUE%';

-- Проверяем политики RLS на user_progress
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_progress';

-- Смотрим реальные данные прогресса
SELECT 
  up.user_id,
  p.email,
  up.lesson_index,
  up.completed,
  up.completed_at
FROM user_progress up
LEFT JOIN profiles p ON p.id = up.user_id
ORDER BY up.completed_at DESC
LIMIT 20;

-- Проверяем количество пройденных уроков по пользователям
SELECT 
  p.email,
  p.full_name,
  COUNT(up.id) as completed_lessons,
  array_agg(up.lesson_index ORDER BY up.lesson_index) as lesson_ids
FROM profiles p
LEFT JOIN user_progress up ON up.user_id = p.id AND up.completed = true
GROUP BY p.id, p.email, p.full_name
ORDER BY completed_lessons DESC;

-- ========================================
-- 3. ПРОВЕРКА ПРОГРЕССА КОНКРЕТНОГО ПОЛЬЗОВАТЕЛЯ
-- ========================================

-- ЗАМЕНИ 'твой@email.com' НА СВОЙ EMAIL!
SELECT 
  p.email,
  p.full_name,
  p.telegram_username,
  p.subscription_status,
  COUNT(up.id) as total_completed,
  array_agg(up.lesson_index ORDER BY up.lesson_index) as completed_lessons
FROM profiles p
LEFT JOIN user_progress up ON up.user_id = p.id AND up.completed = true
WHERE p.email = 'твой@email.com'
GROUP BY p.id, p.email, p.full_name, p.telegram_username, p.subscription_status;

-- ========================================
-- 4. ПРОВЕРКА НА ДУБЛИКАТЫ
-- ========================================

-- Проверяем есть ли дубликаты прогресса (НЕ ДОЛЖНО БЫТЬ!)
SELECT 
  user_id,
  lesson_index,
  COUNT(*) as duplicates
FROM user_progress
GROUP BY user_id, lesson_index
HAVING COUNT(*) > 1;

-- Если дубликаты есть - это проблема! Нужно их удалить:
-- DELETE FROM user_progress
-- WHERE id NOT IN (
--   SELECT MIN(id)
--   FROM user_progress
--   GROUP BY user_id, lesson_index
-- );

-- ========================================
-- 5. ТЕСТОВОЕ СОХРАНЕНИЕ ПРОГРЕССА
-- ========================================

-- ТЕСТ: Пробуем сохранить прогресс для текущего пользователя
-- (выполнится только если ты залогинен в Supabase Dashboard)

INSERT INTO user_progress (
  user_id,
  course_slug,
  lesson_index,
  completed,
  completed_at
) VALUES (
  auth.uid(),  -- Текущий залогиненный пользователь
  'main-course',
  999,  -- Тестовый урок
  true,
  NOW()
)
ON CONFLICT (user_id, lesson_index)
DO UPDATE SET
  completed = true,
  completed_at = NOW(),
  updated_at = NOW();

-- Проверяем что тестовая запись создалась
SELECT *
FROM user_progress
WHERE user_id = auth.uid()
  AND lesson_index = 999;

-- Удаляем тестовую запись
DELETE FROM user_progress
WHERE user_id = auth.uid()
  AND lesson_index = 999;

-- ========================================
-- РЕЗУЛЬТАТЫ ПРОВЕРКИ
-- ========================================

/*
ДОЛЖНО БЫТЬ:

✅ Таблица profiles существует с полями:
   - id, email, full_name, telegram_username
   - subscription_status, created_at, updated_at

✅ Таблица user_progress существует с полями:
   - id, user_id, course_slug, lesson_index
   - completed, completed_at, created_at, updated_at

✅ Есть UNIQUE индекс на (user_id, lesson_index)

✅ RLS включен на обеих таблицах

✅ Политики позволяют пользователям:
   - SELECT своих данных
   - INSERT своих данных
   - UPDATE своих данных

✅ НЕТ дубликатов в user_progress

✅ Тестовая запись создается и удаляется успешно
*/
