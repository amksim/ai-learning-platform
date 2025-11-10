-- ========================================
-- СБРОС ПОДПИСКИ ДЛЯ ТВОЕГО АККАУНТА
-- ========================================

-- ШАГ 1: Проверь свой текущий статус
SELECT id, email, subscription_status, subscription_end_date, stripe_customer_id
FROM profiles 
WHERE email = 'kmak4551@gmail.com';

-- Должно показать:
-- subscription_status = 'premium' (оплачено)


-- ШАГ 2: СБРОС ПОДПИСКИ (убираем оплату)
UPDATE profiles 
SET 
  subscription_status = 'free',
  subscription_end_date = NULL,
  stripe_customer_id = NULL
WHERE email = 'kmak4551@gmail.com';

-- Результат: Теперь твой аккаунт как будто не оплачен


-- ШАГ 3: Проверь что сбросилось
SELECT id, email, subscription_status, subscription_end_date, stripe_customer_id
FROM profiles 
WHERE email = 'kmak4551@gmail.com';

-- Должно показать:
-- subscription_status = 'free' (НЕ оплачено) ✅
-- subscription_end_date = NULL ✅
-- stripe_customer_id = NULL ✅


-- ШАГ 4: (ОПЦИОНАЛЬНО) Удали записи о платежах
-- Если хочешь полностью очистить историю:
DELETE FROM payments 
WHERE user_id = (
  SELECT id FROM profiles WHERE email = 'kmak4551@gmail.com'
);


-- ========================================
-- ГОТОВО!
-- ========================================

-- ✅ После выполнения:
-- 1. Перезагрузи страницу (Cmd+Shift+R)
-- 2. Теперь можешь заново купить курс
-- 3. Платные уроки снова будут заблокированы до оплаты
