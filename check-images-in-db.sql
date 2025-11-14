-- ПРОВЕРЯЕМ ВСЕ УРОКИ И ИХ КАРТИНКИ
SELECT 
  id, 
  title, 
  is_free,
  images,
  videos,
  display_order
FROM courses 
ORDER BY display_order;

-- ПРОВЕРЯЕМ КОНКРЕТНО УРОК "уклцп"
SELECT 
  id, 
  title, 
  images,
  videos
FROM courses 
WHERE title LIKE '%уклцп%' OR title LIKE '%УКЛЦП%';
