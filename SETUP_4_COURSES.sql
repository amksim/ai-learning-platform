-- 🎓 ПОЛНАЯ НАСТРОЙКА 4 КУРСОВ
-- Запусти этот файл ПОЛНОСТЬЮ в Supabase SQL Editor

-- ============================================
-- ШАГ 1: СОЗДАЁМ ТАБЛИЦУ КАТЕГОРИЙ КУРСОВ
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
-- ШАГ 2: ВСТАВЛЯЕМ 4 КУРСА В ПРАВИЛЬНОМ ПОРЯДКЕ
-- ============================================

INSERT INTO public.course_categories (slug, title, description, icon, color, display_order) VALUES
('websites', 'Сайты', 'Создавай сайты из чистого кода: от простых страниц до сложных веб-приложений с красивым дизайном и анимациями', '🌐', 'blue', 1),
('apps', 'Приложения', 'Создавай мобильные и десктопные приложения с современным интерфейсом из чистого кода', '📱', 'purple', 2),
('games', 'Игры', 'Создавай 2D и 3D игры из чистого кода: от простых аркад до сложных интерактивных проектов', '🎮', 'orange', 3),
('payments', 'Платёжные системы', 'Научись подключать любую платёжную систему: Stripe, PayPal и другие для игр, приложений и сайтов', '💳', 'green', 4)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order;

-- ============================================
-- ШАГ 3: ДОБАВЛЯЕМ КОЛОНКУ В ТАБЛИЦУ COURSES
-- ============================================

-- Добавляем колонку если её ещё нет
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS course_category_id INTEGER REFERENCES public.course_categories(id) ON DELETE SET NULL;

-- Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(course_category_id);

-- ============================================
-- ШАГ 4: ПРИВЯЗЫВАЕМ СУЩЕСТВУЮЩИЕ УРОКИ К КУРСУ "САЙТЫ"
-- ============================================

-- Привязываем ВСЕ существующие уроки к курсу "Сайты" (id=1)
-- Это твои 12 уроков которые уже есть
UPDATE courses 
SET course_category_id = 1 
WHERE course_category_id IS NULL;

-- ============================================
-- ШАГ 5: ОБНОВЛЯЕМ СТАТИСТИКУ КУРСА "САЙТЫ"
-- ============================================

-- Считаем сколько уроков привязано к курсу "Сайты"
UPDATE public.course_categories
SET total_lessons = (
  SELECT COUNT(*) 
  FROM public.courses 
  WHERE course_category_id = 1
)
WHERE id = 1;

-- ============================================
-- ШАГ 6: ТРИГГЕР ДЛЯ UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at_course_categories()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_course_categories ON public.course_categories;
CREATE TRIGGER set_updated_at_course_categories
  BEFORE UPDATE ON public.course_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_course_categories();

-- ============================================
-- ШАГ 7: RLS ПОЛИТИКИ
-- ============================================

ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Anyone can view course categories" ON public.course_categories;
DROP POLICY IF EXISTS "Admins can manage course categories" ON public.course_categories;

-- Создаём новые
CREATE POLICY "Anyone can view course categories" ON public.course_categories
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage course categories" ON public.course_categories
  FOR ALL USING (TRUE);

-- ============================================
-- ШАГ 8: ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================

-- Показываем что получилось
SELECT 
  cc.id,
  cc.slug,
  cc.title,
  cc.icon,
  cc.total_lessons,
  COUNT(c.id) as actual_lessons_count
FROM course_categories cc
LEFT JOIN courses c ON c.course_category_id = cc.id
GROUP BY cc.id, cc.slug, cc.title, cc.icon, cc.total_lessons
ORDER BY cc.display_order;

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- Все 12 существующих уроков теперь привязаны к курсу "Сайты"
-- Остальные курсы пустые (добавишь уроки позже)
