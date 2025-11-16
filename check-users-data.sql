-- Проверяем сколько пользователей в таблице users
SELECT COUNT(*) as total_users FROM users;

-- Проверяем есть ли у них referral_code
SELECT 
    COUNT(*) as total_users,
    COUNT(referral_code) as users_with_code,
    COUNT(*) - COUNT(referral_code) as users_without_code
FROM users;

-- Смотрим первых 5 пользователей
SELECT id, email, referral_code, balance 
FROM users 
LIMIT 5;

-- Проверяем структуру таблицы users - есть ли нужные колонки
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name IN ('referral_code', 'referred_by', 'balance', 'total_referrals', 'paid_referrals')
ORDER BY column_name;
