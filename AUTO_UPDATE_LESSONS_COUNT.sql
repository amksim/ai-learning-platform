-- 🔄 АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ СЧЁТЧИКА УРОКОВ
-- При добавлении/удалении урока автоматически обновляется total_lessons

-- ============================================
-- ФУНКЦИЯ: Обновление счётчика уроков
-- ============================================

CREATE OR REPLACE FUNCTION update_course_category_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Если добавили/обновили урок
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    -- Обновляем счётчик для новой категории
    IF NEW.course_category_id IS NOT NULL THEN
      UPDATE course_categories
      SET total_lessons = (
        SELECT COUNT(*) 
        FROM courses 
        WHERE course_category_id = NEW.course_category_id
      )
      WHERE id = NEW.course_category_id;
    END IF;
    
    -- Если изменили категорию (UPDATE), обновляем и старую
    IF (TG_OP = 'UPDATE' AND OLD.course_category_id IS NOT NULL AND OLD.course_category_id != NEW.course_category_id) THEN
      UPDATE course_categories
      SET total_lessons = (
        SELECT COUNT(*) 
        FROM courses 
        WHERE course_category_id = OLD.course_category_id
      )
      WHERE id = OLD.course_category_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Если удалили урок
  IF (TG_OP = 'DELETE') THEN
    IF OLD.course_category_id IS NOT NULL THEN
      UPDATE course_categories
      SET total_lessons = (
        SELECT COUNT(*) 
        FROM courses 
        WHERE course_category_id = OLD.course_category_id
      )
      WHERE id = OLD.course_category_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ТРИГГЕР: Автообновление при INSERT/UPDATE/DELETE
-- ============================================

-- Удаляем старый триггер если есть
DROP TRIGGER IF EXISTS update_lesson_count_trigger ON courses;

-- Создаём новый
CREATE TRIGGER update_lesson_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_course_category_lesson_count();

-- ============================================
-- СРАЗУ ОБНОВЛЯЕМ СЧЁТЧИКИ ДЛЯ ВСЕХ КУРСОВ
-- ============================================

UPDATE course_categories cc
SET total_lessons = (
  SELECT COUNT(*) 
  FROM courses c 
  WHERE c.course_category_id = cc.id
);

-- ============================================
-- ПРОВЕРКА: Показываем результат
-- ============================================

SELECT 
  cc.id,
  cc.title,
  cc.total_lessons as "счётчик в БД",
  COUNT(c.id) as "реальных уроков"
FROM course_categories cc
LEFT JOIN courses c ON c.course_category_id = cc.id
GROUP BY cc.id, cc.title, cc.total_lessons
ORDER BY cc.display_order;

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- Теперь при:
-- - Добавлении урока → счётчик +1
-- - Удалении урока → счётчик -1
-- - Перемещении урока → пересчёт обеих категорий
