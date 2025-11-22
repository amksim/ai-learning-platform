-- ✨ СОЗДАНИЕ НОВОЙ СИСТЕМЫ СТАТИСТИКИ
-- Создаём всё заново с нуля

-- ============================================
-- ШАГ 1: СОЗДАТЬ НОВЫЕ КОЛОНКИ
-- ============================================

ALTER TABLE course_categories
ADD COLUMN video_minutes INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE course_categories
ADD COLUMN text_pages INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE course_categories
ADD COLUMN practice_tasks INTEGER DEFAULT 0 NOT NULL;

-- ============================================
-- ШАГ 2: УСТАНОВИТЬ НАЧАЛЬНЫЕ ЗНАЧЕНИЯ
-- ============================================

-- Сайты
UPDATE course_categories
SET 
  video_minutes = 180,
  text_pages = 25,
  practice_tasks = 12
WHERE slug = 'websites';

-- Приложения
UPDATE course_categories
SET 
  video_minutes = 120,
  text_pages = 18,
  practice_tasks = 8
WHERE slug = 'apps';

-- Игры
UPDATE course_categories
SET 
  video_minutes = 150,
  text_pages = 20,
  practice_tasks = 10
WHERE slug = 'games';

-- Платёжные системы
UPDATE course_categories
SET 
  video_minutes = 90,
  text_pages = 15,
  practice_tasks = 6
WHERE slug = 'payments';

-- ============================================
-- ШАГ 3: СОЗДАТЬ ПОЛИТИКИ RLS
-- ============================================

-- Публичное чтение
CREATE POLICY "course_categories_select_policy"
ON course_categories
FOR SELECT
TO public
USING (true);

-- Публичное обновление (для админки)
CREATE POLICY "course_categories_update_policy"
ON course_categories
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- ============================================
-- ШАГ 4: ПРОВЕРКА
-- ============================================

SELECT 
  slug,
  title,
  video_minutes,
  text_pages,
  practice_tasks
FROM course_categories
ORDER BY display_order;

-- ============================================
-- ГОТОВО! ✅
-- ============================================
