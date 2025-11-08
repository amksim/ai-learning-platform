-- ============================================
-- ТАБЛИЦА ДЛЯ КУРСОВ - ДИНАМИЧЕСКОЕ УПРАВЛЕНИЕ
-- ============================================

-- Создаём таблицу курсов
CREATE TABLE IF NOT EXISTS public.courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  topics TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  block_name TEXT,
  practice BOOLEAN DEFAULT false,
  practice_description TEXT,
  is_free BOOLEAN DEFAULT false,
  translations JSONB DEFAULT '{}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Отключаем RLS (чтобы все могли читать курсы)
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;

-- Даём права на чтение всем
GRANT SELECT ON public.courses TO anon;
GRANT SELECT ON public.courses TO authenticated;

-- Даём права на запись только аутентифицированным (для админа)
GRANT INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE courses_id_seq TO authenticated;

-- Создаём индекс для быстрого поиска
CREATE INDEX idx_courses_order ON public.courses(display_order);
CREATE INDEX idx_courses_free ON public.courses(is_free);

-- Таблица готова! 
-- Курсы будут добавлены через админку
-- Нет предзаполненных данных - админ создаст всё сам

-- Функция для автообновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автообновления
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Проверка таблицы (пока пустая)
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'courses'
ORDER BY ordinal_position;

-- Когда добавишь курсы через админку, проверь так:
-- SELECT id, title, is_free, display_order FROM public.courses ORDER BY display_order;
