-- 🔍 ДИАГНОСТИКА ПРОБЛЕМЫ С РЕФЕРАЛЬНЫМ КОДОМ

-- Шаг 1: Проверяем существование таблицы users
SELECT 
    'users table exists' as check_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) as result;

-- Шаг 2: Проверяем все колонки в таблице users
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users' 
    AND table_schema = 'public'
    AND column_name IN ('referral_code', 'balance', 'total_referrals', 'paid_referrals', 'referred_by')
ORDER BY column_name;

-- Шаг 3: Проверяем количество пользователей
SELECT 
    COUNT(*) as total_users,
    COUNT(referral_code) as users_with_code,
    COUNT(*) - COUNT(referral_code) as users_without_code
FROM users;

-- Шаг 4: Показываем первых 3 пользователей с их кодами
SELECT 
    id,
    email,
    referral_code,
    balance,
    total_referrals,
    paid_referrals
FROM users 
ORDER BY created_at DESC
LIMIT 3;

-- Шаг 5: Проверяем есть ли функция generate_referral_code
SELECT 
    'generate_referral_code function exists' as check_name,
    EXISTS (
        SELECT FROM pg_proc 
        WHERE proname = 'generate_referral_code'
    ) as result;
