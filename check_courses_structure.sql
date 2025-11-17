-- Проверка структуры таблицы courses

-- Шаг 1: Показать все колонки
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'courses'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Шаг 2: Показать первый курс с его images
SELECT 
    id,
    title,
    images,
    videos,
    pg_typeof(images) as images_type
FROM courses
ORDER BY id DESC
LIMIT 3;
