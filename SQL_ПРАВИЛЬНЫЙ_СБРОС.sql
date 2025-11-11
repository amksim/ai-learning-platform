-- ========================================
-- ПРАВИЛЬНЫЙ SQL ДЛЯ СБРОСА ПОДПИСКИ
-- ========================================

-- ⚠️ ВАЖНО: Email должен быть в ОДИНАРНЫХ кавычках ' '

-- ПРАВИЛЬНО ✅ (с кавычками):
UPDATE profiles 
SET 
  subscription_status = 'free',
  subscription_end_date = NULL,
  stripe_customer_id = NULL
WHERE email = 'kmak4551@gmail.com';

-- НЕПРАВИЛЬНО ❌ (без кавычек):
-- WHERE email = kmak4551@gmail.com;  ← ЭТО ОШИБКА!


-- ========================================
-- ПРОВЕРКА РЕЗУЛЬТАТА
-- ========================================

-- После выполнения UPDATE проверь:
SELECT id, email, subscription_status, subscription_end_date
FROM profiles
WHERE email = 'kmak4551@gmail.com';

-- Должно показать:
-- subscription_status = 'free'
-- subscription_end_date = NULL
-- stripe_customer_id = NULL


-- ========================================
-- ГОТОВО!
-- ========================================

-- После этого:
-- 1. Перезагрузи сайт (Cmd+Shift+R)
-- 2. Выйди и войди заново
-- 3. Платные уроки должны быть заблокированы
-- 4. Можешь заново купить курс
