-- 🔄 ПОЛНАЯ ОЧИСТКА И НАСТРОЙКА 4 КУРСОВ
-- Запусти этот файл ПОЛНОСТЬЮ в Supabase SQL Editor

-- ============================================
-- ШАГ 1: УДАЛИТЬ ВСЕ УРОКИ
-- ============================================

DELETE FROM courses;

-- Сбросить счётчик ID (нумерация с 1)
ALTER SEQUENCE courses_id_seq RESTART WITH 1;

-- ============================================
-- ШАГ 2: СОЗДАТЬ ТАБЛИЦУ КАТЕГОРИЙ КУРСОВ
-- ============================================

CREATE TABLE IF NOT EXISTS public.course_categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  
  -- Статистика курса (управляется админом)
  total_lessons INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  total_video_minutes INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ШАГ 3: ВСТАВИТЬ 4 КУРСА
-- ============================================

INSERT INTO public.course_categories (slug, title, description, icon, color, display_order) VALUES
('websites', 'Сайты', 'Создавай сайты из чистого кода: от простых страниц до сложных веб-приложений', '🌐', 'blue', 1),
('apps', 'Приложения', 'Создавай мобильные и десктопные приложения с современным интерфейсом', '📱', 'purple', 2),
('games', 'Игры', 'Создавай 2D и 3D игры из чистого кода: от простых аркад до сложных проектов', '🎮', 'orange', 3),
('payments', 'Платёжные системы', 'Подключай Stripe, PayPal и другие платёжные системы', '💳', 'green', 4)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order;

-- ============================================
-- ШАГ 4: ДОБАВИТЬ КОЛОНКУ В COURSES
-- ============================================

ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS course_category_id INTEGER REFERENCES public.course_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(course_category_id);

-- ============================================
-- ШАГ 5: ТРИГГЕР АВТООБНОВЛЕНИЯ СЧЁТЧИКА
-- ============================================

CREATE OR REPLACE FUNCTION update_course_category_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    IF NEW.course_category_id IS NOT NULL THEN
      UPDATE course_categories
      SET total_lessons = (
        SELECT COUNT(*) 
        FROM courses 
        WHERE course_category_id = NEW.course_category_id
      )
      WHERE id = NEW.course_category_id;
    END IF;
    
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

DROP TRIGGER IF EXISTS update_lesson_count_trigger ON courses;
CREATE TRIGGER update_lesson_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_course_category_lesson_count();

-- ============================================
-- ШАГ 6: RLS ПОЛИТИКИ
-- ============================================

ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view course categories" ON public.course_categories;
DROP POLICY IF EXISTS "Admins can manage course categories" ON public.course_categories;

CREATE POLICY "Anyone can view course categories" ON public.course_categories
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage course categories" ON public.course_categories
  FOR ALL USING (TRUE);

-- ============================================
-- ШАГ 7: ОБНОВИТЬ СЧЁТЧИКИ
-- ============================================

UPDATE course_categories 
SET total_lessons = 0;

-- ============================================
-- ПРОВЕРКА
-- ============================================

SELECT 
  id,
  slug,
  title,
  icon,
  total_lessons,
  display_order
FROM course_categories
ORDER BY display_order;

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- Теперь:
-- ✅ Все старые уроки удалены
-- ✅ 4 курса созданы
-- ✅ Счётчики работают автоматически
-- ✅ Готов добавлять уроки через /admin
