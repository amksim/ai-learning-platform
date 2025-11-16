-- Быстрая проверка: сколько пользователей БЕЗ referral_code
SELECT 
    COUNT(*) as total_users,
    COUNT(referral_code) as users_with_code,
    COUNT(*) - COUNT(referral_code) as users_WITHOUT_code
FROM users;

-- Смотрим первых 3 пользователей
SELECT id, email, referral_code 
FROM users 
LIMIT 3;
