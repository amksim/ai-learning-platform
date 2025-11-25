-- Таблица для промо-видео (скидка за рекламу)
-- Выполни этот SQL в Supabase SQL Editor

CREATE TABLE IF NOT EXISTS promo_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  video_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Индекс для быстрого поиска по статусу
CREATE INDEX IF NOT EXISTS idx_promo_videos_status ON promo_videos(status);

-- Индекс для быстрого поиска по email
CREATE INDEX IF NOT EXISTS idx_promo_videos_email ON promo_videos(user_email);

-- Добавляем колонку has_promo_discount в users если её нет
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_promo_discount BOOLEAN DEFAULT FALSE;

-- RLS политики (если нужны)
ALTER TABLE promo_videos ENABLE ROW LEVEL SECURITY;

-- Политика для админа (полный доступ)
CREATE POLICY "Admin full access" ON promo_videos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Готово! Теперь таблица создана.
