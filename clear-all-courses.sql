-- ВНИМАНИЕ! Это удалит ВСЕ курсы из базы данных!
-- Используй только если уверен!

-- Удаляем все курсы
DELETE FROM courses;

-- Сбрасываем счетчик ID (чтобы новые курсы начинались с 1)
ALTER SEQUENCE courses_id_seq RESTART WITH 1;

-- Проверяем что таблица пустая
SELECT COUNT(*) as total_courses FROM courses;

-- Должно вернуть: total_courses = 0
