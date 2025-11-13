-- Добавление поля telegram_username в таблицу profiles
-- Дата: 2025-11-13

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Комментарий к полю
COMMENT ON COLUMN public.profiles.telegram_username IS 'Telegram username пользователя для связи (без @)';
