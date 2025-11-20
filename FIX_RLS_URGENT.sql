-- 🔥 СРОЧНОЕ ИСПРАВЛЕНИЕ RLS
-- Выполни этот SQL в Supabase SQL Editor прямо сейчас!

-- 1. ВКЛЮЧАЕМ RLS на всех таблицах
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. УДАЛЯЕМ старые политики (если есть)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own projects" ON public.user_projects;
DROP POLICY IF EXISTS "Users can create own projects" ON public.user_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.user_projects;

-- 3. СОЗДАЕМ ПРАВИЛЬНЫЕ ПОЛИТИКИ

-- === PROFILES ===
-- Каждый видит только свой профиль
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Каждый обновляет только свой профиль
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- При регистрации можно создать свой профиль
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- === USER_PROGRESS ===
-- Каждый видит только свой прогресс
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Каждый добавляет только свой прогресс
CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Каждый обновляет только свой прогресс
CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- === PAYMENTS ===
-- Каждый видит только свои платежи (только чтение!)
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- === USER_PROJECTS ===
-- Видят свои проекты + публичные проекты других
CREATE POLICY "Users can view projects" ON public.user_projects
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

-- Каждый создает только свои проекты
CREATE POLICY "Users can create own projects" ON public.user_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Каждый обновляет только свои проекты
CREATE POLICY "Users can update own projects" ON public.user_projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Каждый удаляет только свои проекты
CREATE POLICY "Users can delete own projects" ON public.user_projects
  FOR DELETE USING (auth.uid() = user_id);

-- === USERS (для реферальной системы) ===
-- Каждый видит только свою запись
CREATE POLICY "Users can view own record" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- При регистрации можно создать свою запись
CREATE POLICY "Users can insert own record" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. ПРОВЕРКА - ЭТО ДОЛЖНО ПОКАЗАТЬ ВСЕ ПОЛИТИКИ
SELECT 
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. ПРОВЕРКА RLS СТАТУСА - ВЕЗДЕ ДОЛЖНО БЫТЬ true
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'user_progress', 'payments', 'user_projects', 'users')
ORDER BY tablename;

-- ✅ ГОТОВО!
-- После выполнения этого SQL:
-- - RLS будет включен
-- - Политики будут настроены
-- - Каждый пользователь видит только свои данные
