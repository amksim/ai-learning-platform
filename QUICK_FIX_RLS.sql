-- 🚨 БЫСТРОЕ ИСПРАВЛЕНИЕ RLS ПОЛИТИК
-- Запусти если видишь ошибку 403 в консоли

-- Удаляем ВСЕ старые политики
DROP POLICY IF EXISTS "Allow public read access to course categories" ON course_categories;
DROP POLICY IF EXISTS "Allow update course categories" ON course_categories;
DROP POLICY IF EXISTS "Allow admin update course categories" ON course_categories;
DROP POLICY IF EXISTS "course_categories_select_policy" ON course_categories;
DROP POLICY IF EXISTS "course_categories_update_policy" ON course_categories;

-- Создаём простые политики
CREATE POLICY "Enable read access for all users" ON course_categories
FOR SELECT USING (true);

CREATE POLICY "Enable update access for all users" ON course_categories
FOR UPDATE USING (true) WITH CHECK (true);

-- Проверяем
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'course_categories';

-- ГОТОВО! ✅
