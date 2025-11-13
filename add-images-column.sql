-- Добавляем колонку images в таблицу courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Добавляем комментарий
COMMENT ON COLUMN courses.images IS 'Массив картинок урока с настройками размера и позиции';

-- Проверяем результат
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'courses' 
  AND column_name = 'images';
