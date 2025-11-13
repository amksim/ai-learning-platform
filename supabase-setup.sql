-- Настройка таблицы user_progress для корректного сохранения прогресса

-- 1. Удаляем старую таблицу если есть (ОСТОРОЖНО! Удалит все данные)
-- DROP TABLE IF EXISTS user_progress;

-- 2. Создаем таблицу заново с правильной структурой
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  lesson_index INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  code_submission TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ВАЖНО: Уникальный индекс на user_id + lesson_index
  -- Это предотвращает дубликаты
  CONSTRAINT user_progress_unique UNIQUE (user_id, lesson_index)
);

-- 3. Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(completed);
CREATE INDEX IF NOT EXISTS idx_user_progress_course ON user_progress(course_slug);

-- 4. Включаем Row Level Security (RLS)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 5. Политики доступа
-- Пользователь может видеть только свой прогресс
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Пользователь может создавать свой прогресс
CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователь может обновлять свой прогресс
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Триггер для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Проверка данных
-- SELECT * FROM user_progress ORDER BY created_at DESC LIMIT 10;
