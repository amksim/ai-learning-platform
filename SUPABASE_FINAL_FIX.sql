-- ============================================
-- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ - РЕГИСТРАЦИЯ И ПРОФИЛЬ
-- ============================================

-- 1. УДАЛЯЕМ ВСЁ (начинаем с чистого листа)
DELETE FROM user_progress;
DELETE FROM payments;
DELETE FROM user_projects;
DELETE FROM profiles;
DELETE FROM auth.users;

-- 2. УДАЛЯЕМ СТАРЫЕ ТРИГГЕРЫ И ФУНКЦИИ
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
DROP FUNCTION IF EXISTS public.auto_confirm_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. СОЗДАЁМ ФУНКЦИЮ ДЛЯ АВТОПОДТВЕРЖДЕНИЯ EMAIL
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Автоматически подтверждаем email
  NEW.email_confirmed_at = NOW();
  NEW.confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. СОЗДАЁМ ТРИГГЕР АВТОПОДТВЕРЖДЕНИЯ
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

-- 5. СОЗДАЁМ ФУНКЦИЮ ДЛЯ СОЗДАНИЯ ПРОФИЛЯ
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Создаём профиль для нового пользователя
  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    has_purchased,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NULL,
    FALSE,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. СОЗДАЁМ ТРИГГЕР ДЛЯ СОЗДАНИЯ ПРОФИЛЯ
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. ПРОВЕРЯЕМ ЧТО ВСЁ СОЗДАНО
SELECT 
  'ГОТОВО! Триггеры созданы:' as status,
  COUNT(*) FILTER (WHERE trigger_name = 'on_auth_user_created') as auto_confirm_trigger,
  COUNT(*) FILTER (WHERE trigger_name = 'on_auth_user_created_profile') as profile_trigger
FROM information_schema.triggers
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth';
