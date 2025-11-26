-- ========================================
-- ПОЛНЫЙ СБРОС СИСТЕМЫ АВТОРИЗАЦИИ
-- Выполни этот SQL в Supabase SQL Editor
-- ========================================

-- 1. УДАЛЯЕМ ВСЕ ПОЛИТИКИ
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_service_role_all" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- 2. УДАЛЯЕМ ТАБЛИЦУ PROFILES И СОЗДАЁМ ЗАНОВО
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  paid_courses INTEGER[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ВКЛЮЧАЕМ RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. СОЗДАЁМ ПРОСТЫЕ ПОЛИТИКИ
-- Каждый видит только свой профиль
CREATE POLICY "select_own_profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Каждый может создать только свой профиль
CREATE POLICY "insert_own_profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Каждый может обновить только свой профиль
CREATE POLICY "update_own_profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Service role имеет полный доступ (для webhook'ов)
CREATE POLICY "service_role_all" ON profiles
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. СОЗДАЁМ ФУНКЦИЮ ДЛЯ АВТОМАТИЧЕСКОГО СОЗДАНИЯ ПРОФИЛЯ
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email = 'amksim.coder@gmail.com' -- Админ email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. УДАЛЯЕМ СТАРЫЙ ТРИГГЕР И СОЗДАЁМ НОВЫЙ
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. ПРОВЕРКА - показать структуру
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles';
