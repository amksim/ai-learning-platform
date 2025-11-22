-- 🗑️ УДАЛЕНИЕ СТАРОЙ СИСТЕМЫ СТАТИСТИКИ
-- Полностью удаляем все старые поля и политики

-- ============================================
-- ШАГ 1: УДАЛИТЬ СТАРЫЕ ПОЛИТИКИ
-- ============================================

DROP POLICY IF EXISTS "Allow public read access to course categories" ON course_categories;
DROP POLICY IF EXISTS "Allow update course categories" ON course_categories;
DROP POLICY IF EXISTS "Allow admin update course categories" ON course_categories;

-- ============================================
-- ШАГ 2: УДАЛИТЬ СТАРЫЕ КОЛОНКИ
-- ============================================

ALTER TABLE course_categories
DROP COLUMN IF EXISTS video_minutes CASCADE;

ALTER TABLE course_categories
DROP COLUMN IF EXISTS text_pages CASCADE;

ALTER TABLE course_categories
DROP COLUMN IF EXISTS practice_tasks CASCADE;

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- Теперь запусти CREATE_NEW_STATS.sql
