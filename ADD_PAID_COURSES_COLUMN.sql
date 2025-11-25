-- Добавляем колонку paid_courses в profiles
-- Выполни этот SQL в Supabase SQL Editor

-- Массив ID оплаченных курсов (категорий)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paid_courses INTEGER[] DEFAULT '{}';

-- Для тех у кого уже premium - даём доступ ко всем курсам
-- UPDATE profiles SET paid_courses = ARRAY[1, 2, 3, 4] WHERE subscription_status = 'premium';

-- Проверка
-- SELECT email, subscription_status, paid_courses FROM profiles;
