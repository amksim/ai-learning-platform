-- ========================================
-- ИСПРАВЛЕНИЕ RLS ДЛЯ АВТОРИЗАЦИИ
-- Выполни этот SQL в Supabase SQL Editor
-- ========================================

-- 1. Отключаем RLS временно для profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Удаляем ВСЕ старые политики для profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Allow insert for service role" ON profiles;
DROP POLICY IF EXISTS "Allow all for authenticated" ON profiles;

-- 3. Включаем RLS обратно
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Создаём ПРАВИЛЬНЫЕ политики
-- Пользователи могут видеть ТОЛЬКО свой профиль
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Пользователи могут создавать ТОЛЬКО свой профиль
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Пользователи могут обновлять ТОЛЬКО свой профиль
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Даём service_role полный доступ (для webhook'ов и API)
CREATE POLICY "profiles_service_role_all"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ========================================
-- ИСПРАВЛЕНИЕ RLS ДЛЯ USER_PROGRESS
-- ========================================

ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_select_own"
ON user_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "progress_insert_own"
ON user_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_update_own"
ON user_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_service_role_all"
ON user_progress FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ========================================
-- ПРОВЕРКА
-- ========================================
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_progress')
ORDER BY tablename, policyname;
