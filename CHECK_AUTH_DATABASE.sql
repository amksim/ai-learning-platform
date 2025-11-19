-- 🔍 ПРОВЕРКА БАЗЫ ДАННЫХ ДЛЯ АВТОРИЗАЦИИ
-- Выполни этот скрипт в Supabase SQL Editor

-- 1. Проверяем таблицу profiles
SELECT 'Проверка таблицы profiles' as check_name;
SELECT 
  id,
  email,
  full_name,
  telegram_username,
  subscription_status,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- 2. Проверяем таблицу users (для реферальной системы)
SELECT 'Проверка таблицы users' as check_name;
SELECT 
  id,
  email,
  full_name,
  referred_by,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- 3. Проверяем есть ли твой email
SELECT 'Поиск email kmak4551@gmail.com' as check_name;
SELECT 
  id,
  email,
  full_name,
  subscription_status
FROM profiles
WHERE email = 'kmak4551@gmail.com';

-- 4. Проверяем RLS политики на profiles
SELECT 'RLS политики на profiles' as check_name;
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

-- 5. Проверяем что RLS включен
SELECT 'RLS статус' as check_name;
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'users', 'user_progress');

-- ⚠️ ЕСЛИ У ТЕБЯ ПРОБЛЕМЫ С РЕГИСТРАЦИЕЙ, ВЫПОЛНИ ЭТО:
-- (Раскомментируй если нужно)

-- -- Временно отключаем RLS для отладки
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- -- Добавляем политику для создания профиля
-- DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
-- CREATE POLICY "Enable insert for authenticated users" ON profiles
--   FOR INSERT WITH CHECK (auth.uid() = id);

-- -- Включаем RLS обратно
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
