-- СНАЧАЛА ПРОВЕРИМ ЧТО КОЛОНКИ НЕТ
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'courses' 
  AND column_name = 'images';

-- ДОБАВЛЯЕМ КОЛОНКУ images
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- ДОБАВЛЯЕМ КОЛОНКУ videos ДЛЯ ВИДЕО
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;

-- ПРОВЕРЯЕМ ЧТО КОЛОНКИ ПОЯВИЛИСЬ
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'courses' 
  AND (column_name = 'images' OR column_name = 'videos');

-- ПРОВЕРЯЕМ УРОК #3
SELECT id, title, is_free, images, videos 
FROM courses 
WHERE id = 3;
