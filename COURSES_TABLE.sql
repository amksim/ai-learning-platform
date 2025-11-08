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

-- Вставляем начальные 3 курса
INSERT INTO public.courses (
  title, 
  description, 
  difficulty, 
  topics, 
  category, 
  icon, 
  block_name, 
  practice, 
  practice_description, 
  is_free, 
  display_order
) VALUES 
(
  'Твоя жизнь изменится уже сегодня',
  'Представь: ты просыпаешься, открываешь ноутбук и начинаешь работать. Не в офисе, не в пробках, а там, где тебе комфортно. Заказываешь проект за $500, делаешь его за день с помощью нейросети, и это только начало. В этом уроке ты узнаешь, почему тысячи людей уже зарабатывают так, и почему это реально работает.',
  'beginner',
  ARRAY['Реальные возможности фриланса', 'Как нейросети изменили всё', 'Почему не нужно быть программистом', 'Первые деньги через неделю'],
  'foundation',
  'Sparkles',
  'Начало пути',
  true,
  'Подумай о проекте, который ты хочешь создать. Это может быть сайт для бизнеса, игра, приложение для продуктивности - что угодно. Запиши свою идею. Мы воплотим её в реальность уже через несколько уроков, используя мощную нейросеть.',
  true,
  1
),
(
  'Почему фриланс - это твоя свобода',
  'Офис, начальник, 9 до 6, зарплата которой едва хватает - знакомо? А теперь посмотри на другую реальность: работаешь когда хочешь, берёшь проекты которые нравятся, зарабатываешь столько, сколько готов работать. Фриланс это не про работу - это про свободу. И с нейросетью, которую мы используем, ты можешь создавать проекты в 10 раз быстрее профессионалов. Звучит нереально? В этом уроке увидишь реальные цифры и возможности.',
  'beginner',
  ARRAY['Свобода выбора: работай откуда хочешь', 'Доход без потолка: бери столько проектов, сколько хочешь', 'Никаких офисов и начальников', 'Путешествуй и зарабатывай', 'Строй бизнес, а не работай на кого-то', 'Реальные заработки фрилансеров: $2000-$10000/месяц'],
  'foundation',
  'TrendingUp',
  'Начало пути',
  true,
  'Посчитай свою текущую зарплату и сравни с возможностями фриланса. Если делать по 2 проекта в неделю по $300 каждый = $2400 в месяц. А если по 4 проекта? $4800. И это при работе по 2-3 часа в день с нейросетью. Запиши свою цель дохода на первые 3 месяца.',
  true,
  2
),
(
  'Секретное оружие: нейросеть для создания всего',
  'Вот главный секрет: ты не будешь писать код. Вообще. Есть нейросеть, которая делает ВСЁ за тебя. Ты просто говоришь ей на обычном языке что нужно - и она создаёт готовый сайт, игру или приложение. Звучит как магия? Это реальность 2025 года. В этом курсе мы работаем с самой мощной нейросетью для создания программ. Она знает все языки программирования, все фреймворки, и работает в 100 раз быстрее человека. Ты будешь её режиссёром.',
  'beginner',
  ARRAY['Что такое нейросеть для разработки', 'Почему она лучше чем учить программирование годами', 'Как работает: говоришь - получаешь результат', 'Что можно создавать: сайты, игры, приложения, всё', 'Реальные примеры: от идеи до готового проекта за час', 'Почему это не обман: технология которую используют топ-компании', 'Твоё преимущество: пока другие учатся, ты уже зарабатываешь'],
  'foundation',
  'Zap',
  'Начало пути',
  true,
  'Подумай о 3 вещах, которые ты хочешь создать с помощью нейросети: 1. Сайт (может быть для бизнеса, портфолио, магазин) 2. Приложение (калькулятор, трекер привычек, планировщик) 3. Игра (головоломка, аркада, квест). Запиши их. После покупки курса мы создадим все 3 проекта вместе, и ты сможешь продавать такие же за деньги.',
  true,
  3
)
ON CONFLICT DO NOTHING;

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

-- Проверка
SELECT 
  id,
  title,
  is_free,
  display_order
FROM public.courses
ORDER BY display_order;
