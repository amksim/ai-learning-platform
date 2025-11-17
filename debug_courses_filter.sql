-- Проверяем все курсы и почему они фильтруются

-- Показываем ВСЕ курсы с их данными
SELECT 
    id,
    title,
    description,
    difficulty,
    CASE 
        WHEN title IS NULL OR title = '' THEN 'NO_TITLE'
        WHEN description IS NULL OR description = '' THEN 'NO_DESCRIPTION' 
        WHEN difficulty IS NULL OR difficulty = '' THEN 'NO_DIFFICULTY'
        WHEN NOT (images IS NOT NULL AND json_array_length(images) > 0) 
         AND NOT (videos IS NOT NULL AND json_array_length(videos) > 0) THEN 'NO_CONTENT'
        ELSE 'VALID'
    END as status,
    images,
    videos,
    display_order
FROM courses
ORDER BY display_order ASC, id ASC;
