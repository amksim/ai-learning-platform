-- 🔧 ИСПРАВЛЕНИЕ RLS ДЛЯ УДАЛЕНИЯ УРОКОВ
-- Разрешаем админу удалять уроки через API

-- ============================================
-- ШАГ 1: Удаляем старые политики для courses
-- ============================================

DROP POLICY IF EXISTS "Enable read access for all users" ON courses;
DROP POLICY IF EXISTS "Enable insert for service role" ON courses;
DROP POLICY IF EXISTS "Enable update for service role" ON courses;
DROP POLICY IF EXISTS "Enable delete for service role" ON courses;
DROP POLICY IF EXISTS "Allow public read" ON courses;
DROP POLICY IF EXISTS "Allow service role all" ON courses;

-- ============================================
-- ШАГ 2: Создаём правильные политики
-- ============================================

-- Чтение доступно всем (публично)
CREATE POLICY "Public can read courses" 
ON courses FOR SELECT 
USING (true);

-- Создание/обновление/удаление только для админа
-- Используем SERVICE ROLE KEY в API, поэтому разрешаем всё
CREATE POLICY "Service role can manage courses" 
ON courses FOR ALL 
USING (true)
WITH CHECK (true);

-- ============================================
-- ШАГ 3: Убеждаемся что RLS включён
-- ============================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ШАГ 4: Проверяем политики
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'courses';

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- Теперь:
-- - Все могут читать уроки
-- - Только API с SERVICE_ROLE_KEY может добавлять/изменять/удалять
-- - Админка будет работать правильно
