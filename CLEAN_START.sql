-- ============================================
-- ПОЛНАЯ ОЧИСТКА И НОВЫЙ СТАРТ
-- ============================================

-- 1. УДАЛЯЕМ ВСЁ
DELETE FROM user_progress;
DELETE FROM payments;
DELETE FROM user_projects;
DELETE FROM profiles;
DELETE FROM auth.users;

-- 2. УДАЛЯЕМ ВСЕ ТРИГГЕРЫ И ФУНКЦИИ
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS public.auto_confirm_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. ОТКЛЮЧАЕМ RLS НА ВСЕХ ТАБЛИЦАХ
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects DISABLE ROW LEVEL SECURITY;

-- 4. ДАЁМ ПРАВА ВСЕМ
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON user_progress TO anon, authenticated;
GRANT ALL ON payments TO anon, authenticated;
GRANT ALL ON user_projects TO anon, authenticated;

-- 5. СОЗДАЁМ ФУНКЦИЮ АВТОПОДТВЕРЖДЕНИЯ EMAIL
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = NOW();
  NEW.confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ТРИГГЕР АВТОПОДТВЕРЖДЕНИЯ
CREATE TRIGGER confirm_email_on_signup
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_email();

-- 7. ПРОВЕРКА
SELECT '✅ База очищена и готова!' as status;
