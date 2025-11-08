-- ============================================
-- ОТКЛЮЧАЕМ RLS ДЛЯ СОЗДАНИЯ ПРОФИЛЕЙ
-- ============================================

-- 1. Удаляем старый триггер
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Удаляем все RLS политики на profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 3. ОТКЛЮЧАЕМ RLS НА profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 4. Даём всем право создавать профили
GRANT INSERT, SELECT, UPDATE ON profiles TO anon, authenticated;

-- 5. Проверка
SELECT 
  'RLS отключен!' as status,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';
