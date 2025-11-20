-- 🔥 ИСПРАВЛЕННОЕ ВКЛЮЧЕНИЕ RLS (без ошибок)
-- Выполни этот SQL в Supabase SQL Editor

-- 1. ВКЛЮЧАЕМ RLS на всех таблицах
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ ВСЕ старые политики
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

DROP POLICY IF EXISTS "Users can view projects" ON public.user_projects;
DROP POLICY IF EXISTS "Users can view own projects" ON public.user_projects;
DROP POLICY IF EXISTS "Users can create own projects" ON public.user_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.user_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.user_projects;

DROP POLICY IF EXISTS "Users can view own record" ON public.users;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;

-- 3. СОЗДАЕМ НОВЫЕ ПРАВИЛЬНЫЕ ПОЛИТИКИ

-- === PROFILES ===
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- === USER_PROGRESS ===
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- === PAYMENTS ===
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- === USER_PROJECTS ===
CREATE POLICY "Users can view projects" ON public.user_projects
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create own projects" ON public.user_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.user_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.user_projects
  FOR DELETE USING (auth.uid() = user_id);

-- === USERS (реферальная система) ===
CREATE POLICY "Users can view own record" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own record" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. ПРОВЕРКА РЕЗУЛЬТАТА
SELECT '✅ Проверка RLS статуса' as status;
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'user_progress', 'payments', 'user_projects', 'users')
ORDER BY tablename;

SELECT '✅ Проверка политик' as status;
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
