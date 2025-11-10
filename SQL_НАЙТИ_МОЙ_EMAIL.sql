-- ========================================
-- ШАГ 1: НАЙДЕМ ТВОЙ ПРАВИЛЬНЫЙ EMAIL
-- ========================================

-- Проверяем все emails в базе
SELECT id, email, subscription_status, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Ищем по части email
SELECT id, email, subscription_status
FROM profiles
WHERE email LIKE '%kmak%' OR email LIKE '%4551%';

-- Ищем всех кто оплатил
SELECT id, email, subscription_status
FROM profiles
WHERE subscription_status = 'premium';

-- ========================================
-- КОГДА НАЙДЕШЬ ПРАВИЛЬНЫЙ EMAIL, ИСПОЛЬЗУЙ ЕГО ТУТ:
-- ========================================

-- ЗАМЕНИ 'твой_правильный_email@gmail.com' на тот что нашел выше!
UPDATE profiles 
SET 
  subscription_status = 'free',
  subscription_end_date = NULL,
  stripe_customer_id = NULL
WHERE email = 'твой_правильный_email@gmail.com';

-- После этого проверь:
SELECT id, email, subscription_status
FROM profiles
WHERE email = 'твой_правильный_email@gmail.com';
