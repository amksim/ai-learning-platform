-- 🗑️ ПОЛНОЕ УДАЛЕНИЕ СИСТЕМЫ СТАТИСТИКИ
-- Удаляем всё что связано с video_minutes, text_pages, practice_tasks

-- ============================================
-- ШАГ 1: УДАЛЯЕМ ПОЛИТИКИ
-- ============================================

DROP POLICY IF EXISTS "Enable read access for all users" ON course_categories;
DROP POLICY IF EXISTS "Enable update access for all users" ON course_categories;
DROP POLICY IF EXISTS "Allow public read access to course categories" ON course_categories;
DROP POLICY IF EXISTS "Allow update course categories" ON course_categories;
DROP POLICY IF EXISTS "Allow admin update course categories" ON course_categories;
DROP POLICY IF EXISTS "course_categories_select_policy" ON course_categories;
DROP POLICY IF EXISTS "course_categories_update_policy" ON course_categories;

-- ============================================
-- ШАГ 2: УДАЛЯЕМ КОЛОНКИ
-- ============================================

ALTER TABLE course_categories
DROP COLUMN IF EXISTS video_minutes CASCADE;

ALTER TABLE course_categories
DROP COLUMN IF EXISTS text_pages CASCADE;

ALTER TABLE course_categories
DROP COLUMN IF EXISTS practice_tasks CASCADE;

-- ============================================
-- ШАГ 3: ПРОВЕРКА
-- ============================================

SELECT 
  id, slug, title, icon, display_order
FROM course_categories
ORDER BY display_order;

-- ============================================
-- ГОТОВО! ✅
-- ============================================
