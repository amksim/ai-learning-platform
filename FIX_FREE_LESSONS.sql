-- ИСПРАВЛЕНИЕ: Уроки 1-3 должны быть БЕСПЛАТНЫМИ
-- Это нужно выполнить в Supabase SQL Editor

-- Проверяем текущее состояние
SELECT id, title, is_free 
FROM courses 
WHERE id <= 6
ORDER BY id;

-- Устанавливаем первые 3 урока как бесплатные
UPDATE courses 
SET is_free = true 
WHERE id IN (1, 2, 3);

-- Устанавливаем остальные уроки как платные
UPDATE courses 
SET is_free = false 
WHERE id > 3;

-- Проверяем результат
SELECT id, title, is_free 
FROM courses 
WHERE id <= 6
ORDER BY id;

-- ВАЖНО: После выполнения этого SQL, перезагрузи страницу курсов!
