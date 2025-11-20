-- 📝 СИСТЕМА ЛОГИРОВАНИЯ ИЗМЕНЕНИЙ КУРСОВ
-- Записывает в БД все действия: добавил/удалил/изменил

-- ============================================
-- ШАГ 1: СОЗДАЁМ ТАБЛИЦУ ЛОГОВ
-- ============================================

CREATE TABLE IF NOT EXISTS public.courses_log (
  id SERIAL PRIMARY KEY,
  action TEXT NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'
  course_id INTEGER,
  course_title TEXT,
  old_data JSONB,  -- Старые данные (для UPDATE/DELETE)
  new_data JSONB,  -- Новые данные (для INSERT/UPDATE)
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by TEXT  -- Email админа (если есть)
);

-- Индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_courses_log_action ON courses_log(action);
CREATE INDEX IF NOT EXISTS idx_courses_log_date ON courses_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_courses_log_course_id ON courses_log(course_id);

-- ============================================
-- ШАГ 2: ФУНКЦИЯ ЛОГИРОВАНИЯ
-- ============================================

CREATE OR REPLACE FUNCTION log_course_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- При добавлении курса
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO courses_log (action, course_id, course_title, new_data)
    VALUES (
      'INSERT',
      NEW.id,
      NEW.title,
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;
  
  -- При изменении курса
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO courses_log (action, course_id, course_title, old_data, new_data)
    VALUES (
      'UPDATE',
      NEW.id,
      NEW.title,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;
  
  -- При удалении курса
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO courses_log (action, course_id, course_title, old_data)
    VALUES (
      'DELETE',
      OLD.id,
      OLD.title,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ШАГ 3: ТРИГГЕР НА ТАБЛИЦУ COURSES
-- ============================================

-- Удаляем старый если есть
DROP TRIGGER IF EXISTS courses_change_log ON courses;

-- Создаём новый
CREATE TRIGGER courses_change_log
  AFTER INSERT OR UPDATE OR DELETE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION log_course_changes();

-- ============================================
-- ШАГ 4: RLS ДЛЯ ТАБЛИЦЫ ЛОГОВ
-- ============================================

ALTER TABLE courses_log ENABLE ROW LEVEL SECURITY;

-- Читать могут все (для админки)
CREATE POLICY "Anyone can read logs" ON courses_log
  FOR SELECT USING (TRUE);

-- Писать может только система (через триггер)
CREATE POLICY "Only system can write logs" ON courses_log
  FOR ALL USING (TRUE);

-- ============================================
-- ШАГ 5: ПРОСМОТР ЛОГОВ
-- ============================================

-- Показать последние 20 действий
-- Раскомментируй чтобы посмотреть:
/*
SELECT 
  id,
  action,
  course_id,
  course_title,
  changed_at::timestamp(0) as when_changed,
  CASE 
    WHEN action = 'INSERT' THEN '➕ Добавлен'
    WHEN action = 'UPDATE' THEN '✏️ Изменён'
    WHEN action = 'DELETE' THEN '🗑️ Удалён'
  END as action_emoji
FROM courses_log
ORDER BY changed_at DESC
LIMIT 20;
*/

-- ============================================
-- ШАГ 6: СТАТИСТИКА ПО ДЕЙСТВИЯМ
-- ============================================

-- Сколько раз что делали
-- Раскомментируй чтобы посмотреть:
/*
SELECT 
  CASE 
    WHEN action = 'INSERT' THEN '➕ Добавлено'
    WHEN action = 'UPDATE' THEN '✏️ Изменено'
    WHEN action = 'DELETE' THEN '🗑️ Удалено'
  END as action_type,
  COUNT(*) as count
FROM courses_log
GROUP BY action
ORDER BY COUNT(*) DESC;
*/

-- ============================================
-- ШАГ 7: ОЧИСТИТЬ СТАРЫЕ ЛОГИ (опционально)
-- ============================================

-- Удалить логи старше 30 дней
/*
DELETE FROM courses_log
WHERE changed_at < NOW() - INTERVAL '30 days';
*/

-- ============================================
-- ГОТОВО! 📝
-- ============================================
-- Теперь автоматически записывается:
-- ➕ Когда добавил курс через /admin
-- ✏️ Когда изменил курс через /admin
-- 🗑️ Когда удалил курс через /admin
--
-- Смотреть логи можно в ШАГ 5 или в админке
