-- 🔍 ПРОВЕРКА КУРСОВ ПЕРЕД УДАЛЕНИЕМ
-- Показывает какие курсы есть и помогает решить что удалять

-- ============================================
-- ШАГ 1: ПОКАЗАТЬ ВСЕ КУРСЫ С ДЕТАЛЯМИ
-- ============================================

-- Показываем все курсы с информацией о содержимом
SELECT 
  id,
  title,
  CASE 
    WHEN LENGTH(description) > 50 THEN LEFT(description, 50) || '...'
    ELSE description 
  END as description_preview,
  LENGTH(description) as description_length,
  array_length(topics, 1) as topics_count,
  array_length(images, 1) as images_count,
  array_length(videos, 1) as videos_count,
  is_free,
  course_category_id,
  created_at::date as created_date
FROM courses
ORDER BY id;

-- ============================================
-- ШАГ 2: СТАТИСТИКА ПО СОДЕРЖИМОМУ
-- ============================================

-- Показываем сколько курсов с контентом и без
SELECT 
  'С описанием > 100 символов' as type,
  COUNT(*) as count
FROM courses 
WHERE LENGTH(description) > 100

UNION ALL

SELECT 
  'С видео' as type,
  COUNT(*) as count
FROM courses 
WHERE array_length(videos, 1) > 0

UNION ALL

SELECT 
  'С картинками' as type,
  COUNT(*) as count
FROM courses 
WHERE array_length(images, 1) > 0

UNION ALL

SELECT 
  'С темами (topics)' as type,
  COUNT(*) as count
FROM courses 
WHERE array_length(topics, 1) > 0

UNION ALL

SELECT 
  'ВСЕГО курсов' as type,
  COUNT(*) as count
FROM courses;

-- ============================================
-- ШАГ 3: НАЙТИ "ХОРОШИЕ" КУРСЫ (с контентом)
-- ============================================

-- Курсы которые явно добавлены через админку (с полным контентом)
SELECT 
  id,
  title,
  'ХОРОШИЙ - ОСТАВИТЬ' as status,
  CONCAT(
    'Описание: ', LENGTH(description), ' симв, ',
    'Видео: ', COALESCE(array_length(videos, 1), 0), ', ',
    'Картинки: ', COALESCE(array_length(images, 1), 0), ', ',
    'Темы: ', COALESCE(array_length(topics, 1), 0)
  ) as details
FROM courses
WHERE 
  LENGTH(description) > 100  -- Есть нормальное описание
  OR array_length(videos, 1) > 0  -- Есть видео
  OR array_length(images, 1) > 0  -- Есть картинки
ORDER BY id;

-- ============================================
-- ШАГ 4: НАЙТИ "ПУСТЫЕ" КУРСЫ (старые)
-- ============================================

-- Курсы которые скорее всего старые (без контента)
SELECT 
  id,
  title,
  'ПУСТОЙ - УДАЛИТЬ?' as status,
  CONCAT(
    'Описание: ', LENGTH(description), ' симв, ',
    'Видео: ', COALESCE(array_length(videos, 1), 0), ', ',
    'Картинки: ', COALESCE(array_length(images, 1), 0), ', ',
    'Темы: ', COALESCE(array_length(topics, 1), 0)
  ) as details
FROM courses
WHERE 
  LENGTH(description) <= 100  -- Короткое описание
  AND (array_length(videos, 1) IS NULL OR array_length(videos, 1) = 0)  -- Нет видео
  AND (array_length(images, 1) IS NULL OR array_length(images, 1) = 0)  -- Нет картинок
ORDER BY id;

-- ============================================
-- ГОТОВО! 📊
-- ============================================
-- Посмотри на результаты и реши:
-- - "ХОРОШИЕ" курсы - это твои 14 курсов через админку
-- - "ПУСТЫЕ" курсы - это старые 197 курсов
-- 
-- Если всё правильно, скажи мне и я создам
-- скрипт удаления только ПУСТЫХ курсов
