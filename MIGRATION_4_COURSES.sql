-- 🎓 МИГРАЦИЯ: СИСТЕМА 4 ОТДЕЛЬНЫХ КУРСОВ
-- Создаём таблицу категорий курсов и обновляем структуру

-- 1. Создаём таблицу категорий курсов (4 курса)
CREATE TABLE IF NOT EXISTS public.course_categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji или название иконки
  color TEXT, -- цвет для UI
  
  -- Статистика курса
  total_lessons INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 0, -- страниц текста для чтения
  total_video_minutes INTEGER DEFAULT 0, -- минут видео
  total_tasks INTEGER DEFAULT 0, -- практических заданий
  
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Добавляем связь курсов (lessons) с категориями
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS course_category_id INTEGER REFERENCES public.course_categories(id) ON DELETE SET NULL;

-- Добавляем индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(course_category_id);

-- 3. Вставляем 4 категории курсов
INSERT INTO public.course_categories (slug, title, description, icon, color, display_order) VALUES
('websites', 'Сайты', 'Создавай сайты из чистого кода: от простых страниц до сложных веб-приложений с красивым дизайном и анимациями', '🌐', 'blue', 1),
('apps', 'Приложения', 'Создавай мобильные и десктопные приложения с современным интерфейсом из чистого кода', '📱', 'purple', 2),
('games', 'Игры', 'Создавай 2D и 3D игры из чистого кода: от простых аркад до сложных интерактивных проектов', '🎮', 'orange', 3),
('payments', 'Платёжные системы', 'Научись подключать любую платёжную систему: Stripe, PayPal и другие для игр, приложений и сайтов', '💳', 'green', 4)
ON CONFLICT (slug) DO NOTHING;

-- 4. Создаём триггер для автообновления updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at_course_categories()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_course_categories
  BEFORE UPDATE ON public.course_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_course_categories();

-- 5. RLS политики для course_categories (публичное чтение, админ управление)
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view course categories" ON public.course_categories
  FOR SELECT USING (TRUE);

-- Админы могут всё (пока без проверки роли, можно добавить потом)
CREATE POLICY "Admins can manage course categories" ON public.course_categories
  FOR ALL USING (TRUE);

-- 6. Функция для пересчёта статистики курса
CREATE OR REPLACE FUNCTION public.update_course_category_stats(category_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.course_categories
  SET 
    total_lessons = (
      SELECT COUNT(*) 
      FROM public.courses 
      WHERE course_category_id = category_id
    )
  WHERE id = category_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Комментарии для документации
COMMENT ON TABLE public.course_categories IS '4 категории курсов: Сайты, Приложения, Игры, Платёжные системы';
COMMENT ON COLUMN public.course_categories.total_pages IS 'Общее количество страниц текста для чтения в этом курсе';
COMMENT ON COLUMN public.course_categories.total_video_minutes IS 'Общее количество минут видео в этом курсе';
COMMENT ON COLUMN public.course_categories.total_tasks IS 'Общее количество практических заданий в этом курсе';
