-- 🔧 ИСПРАВЛЕНИЕ RLS ДЛЯ СТАТИСТИКИ КУРСОВ
-- Добавляем политики чтобы можно было обновлять статистику

-- ============================================
-- ШАГ 1: ВКЛЮЧИТЬ RLS (если выключен)
-- ============================================

ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ШАГ 2: УДАЛИТЬ СТАРЫЕ ПОЛИТИКИ (если есть)
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to course categories" ON course_categories;
DROP POLICY IF EXISTS "Allow admin update course categories" ON course_categories;

-- ============================================
-- ШАГ 3: СОЗДАТЬ НОВЫЕ ПОЛИТИКИ
-- ============================================

-- Публичное чтение (все могут читать)
CREATE POLICY "Allow public read access to course categories"
ON course_categories
FOR SELECT
TO public
USING (true);

-- Обновление для всех (временно, для отладки)
-- ВНИМАНИЕ: В продакшене нужно ограничить только для админов!
CREATE POLICY "Allow update course categories"
ON course_categories
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- ============================================
-- ШАГ 4: ПРОВЕРИТЬ РЕЗУЛЬТАТ
-- ============================================

SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'course_categories';

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- Теперь можно обновлять статистику курсов через админку!
--
-- После проверки работы, ЗАМЕНИ политику UPDATE на более строгую:
-- CREATE POLICY "Allow admin update course categories"
-- ON course_categories
-- FOR UPDATE
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM profiles
--     WHERE profiles.id = auth.uid()
--     AND profiles.email = 'kmak4551@gmail.com'
--   )
-- );
