-- Проверяем какие таблицы есть
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'profiles')
ORDER BY table_name;

-- Проверяем структуру таблицы users (если есть)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Проверяем структуру таблицы profiles (если есть)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Проверяем сколько записей в users
SELECT COUNT(*) as users_count FROM users;

-- Проверяем сколько записей в profiles
SELECT COUNT(*) as profiles_count FROM profiles;

-- Проверяем есть ли у пользователей referral_code в users
SELECT id, email, referral_code 
FROM users 
LIMIT 5;

-- Проверяем есть ли у пользователей referral_code в profiles
SELECT id, email, referral_code 
FROM profiles 
LIMIT 5;
