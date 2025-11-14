-- Проверяем есть ли колонка images
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'courses' 
  AND column_name = 'images';

-- Проверяем урок #3 и его картинки
SELECT id, title, is_free, images 
FROM courses 
WHERE id = 3;

-- Проверяем все уроки с картинками
SELECT id, title, is_free, 
       CASE 
         WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
         THEN jsonb_array_length(images) || ' картинок'
         ELSE 'Нет картинок'
       END as images_count
FROM courses 
ORDER BY id;
