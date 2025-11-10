-- ⚠️ СРОЧНОЕ ИСПРАВЛЕНИЕ: ПЕРВЫЕ 3 УРОКА ДОЛЖНЫ БЫТЬ БЕСПЛАТНЫМИ!
-- Эта проблема влияет на ВСЕ языки, так как флаг is_free один для всех языков

-- 1. ПРОВЕРЯЕМ ТЕКУЩЕЕ СОСТОЯНИЕ
SELECT id, title, is_free, display_order
FROM courses 
ORDER BY display_order, id
LIMIT 10;

-- 2. ИСПРАВЛЯЕМ: УСТАНАВЛИВАЕМ ПЕРВЫЕ 3 УРОКА КАК БЕСПЛАТНЫЕ
-- Важно: считаем по display_order, а не по id!

UPDATE courses 
SET is_free = true 
WHERE display_order IN (1, 2, 3);

-- Альтернативный вариант - если display_order не установлен, используем id:
UPDATE courses 
SET is_free = true 
WHERE id IN (1, 2, 3);

-- 3. УСТАНАВЛИВАЕМ ВСЕ ОСТАЛЬНЫЕ УРОКИ КАК ПЛАТНЫЕ
UPDATE courses 
SET is_free = false 
WHERE display_order > 3 OR (display_order IS NULL AND id > 3);

-- 4. ПРОВЕРЯЕМ РЕЗУЛЬТАТ
SELECT id, title, is_free, display_order
FROM courses 
ORDER BY display_order, id
LIMIT 10;

-- 5. СПЕЦИАЛЬНО ПРОВЕРЯЕМ УРОК 6 (КОТОРЫЙ ВЫЗЫВАЛ ПРОБЛЕМУ)
SELECT id, title, is_free, display_order
FROM courses 
WHERE id = 6;

-- ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:
-- id=1: is_free = true  ✅
-- id=2: is_free = true  ✅
-- id=3: is_free = true  ✅
-- id=4: is_free = false ❌
-- id=5: is_free = false ❌
-- id=6: is_free = false ❌ <-- ЭТОТ УРОК ДОЛЖЕН БЫТЬ ПЛАТНЫМ!

-- ⚠️ ВАЖНО: После выполнения этого SQL, обязательно перезагрузи страницу!
-- Данные кешируются в браузере, поэтому нужен Hard Refresh (Cmd+Shift+R на Mac)
