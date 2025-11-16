-- 🔥 ЭТОТ СКРИПТ ТОЧНО СОЗДАСТ КОДЫ ВСЕМ ПОЛЬЗОВАТЕЛЯМ!

-- Шаг 1: Проверяем функцию generate_referral_code
SELECT generate_referral_code() as test_code;

-- Шаг 2: Обновляем ВСЕХ пользователей у кого нет кода
DO $$
DECLARE
    user_record RECORD;
    new_code TEXT;
BEGIN
    FOR user_record IN SELECT id FROM users WHERE referral_code IS NULL
    LOOP
        -- Генерируем код для каждого пользователя
        new_code := generate_referral_code();
        
        -- Обновляем пользователя
        UPDATE users 
        SET referral_code = new_code
        WHERE id = user_record.id;
        
        RAISE NOTICE 'User % got code: %', user_record.id, new_code;
    END LOOP;
END $$;

-- Шаг 3: Проверяем результат
SELECT 
    COUNT(*) as total_users,
    COUNT(referral_code) as users_with_code,
    COUNT(*) - COUNT(referral_code) as users_without_code
FROM users;

-- Шаг 4: Показываем первых 5 пользователей с кодами
SELECT id, email, referral_code 
FROM users 
LIMIT 5;
