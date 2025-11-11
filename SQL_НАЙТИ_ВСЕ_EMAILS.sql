-- ========================================
-- ШАГ 1: НАЙДЕМ ВСЕ EMAILS В БАЗЕ
-- ========================================

-- Смотрим ВСЕ записи в profiles
SELECT id, email, subscription_status, created_at
FROM profiles
ORDER BY created_at DESC;

-- Если много записей, смотрим только последние 20
SELECT id, email, subscription_status, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 20;


-- ========================================
-- ШАГ 2: ИЩЕМ ПО ЧАСТИ EMAIL (без учета регистра)
-- ========================================

-- Ищем любой email содержащий "kmak"
SELECT id, email, subscription_status
FROM profiles
WHERE email ILIKE '%kmak%';

-- Ищем любой email содержащий "4551"
SELECT id, email, subscription_status
FROM profiles
WHERE email ILIKE '%4551%';

-- Ищем любой email с gmail
SELECT id, email, subscription_status
FROM profiles
WHERE email ILIKE '%@gmail.com%';


-- ========================================
-- ШАГ 3: ПОСЛЕ ТОГО КАК НАЙДЕШЬ ПРАВИЛЬНЫЙ EMAIL
-- ========================================

-- Используй ILIKE для сброса (не чувствителен к регистру)
UPDATE profiles 
SET 
  subscription_status = 'free',
  subscription_end_date = NULL,
  stripe_customer_id = NULL
WHERE email ILIKE 'kmak4551@gmail.com';

-- ИЛИ используй ТОЧНЫЙ email который нашел:
-- UPDATE profiles 
-- SET 
--   subscription_status = 'free',
--   subscription_end_date = NULL,
--   stripe_customer_id = NULL
-- WHERE email = 'ТОЧНЫЙ_EMAIL_ИЗ_БАЗЫ';


-- ========================================
-- ШАГ 4: ПРОВЕРКА
-- ========================================

-- Проверь результат
SELECT id, email, subscription_status, subscription_end_date
FROM profiles
WHERE email ILIKE 'kmak4551@gmail.com';

-- Должно показать:
-- subscription_status = 'free'
-- subscription_end_date = NULL
