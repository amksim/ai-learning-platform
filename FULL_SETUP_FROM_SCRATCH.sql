-- ═══════════════════════════════════════════════════════════════
-- 🚀 ПОЛНАЯ УСТАНОВКА AI LEARNING PLATFORM С НУЛЯ
-- ═══════════════════════════════════════════════════════════════
-- Этот скрипт ПЕРЕЗАПИСЫВАЕТ ВСЁ!
-- Запускай его в ПРАВИЛЬНОМ проекте Supabase
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- ЧАСТЬ 1: ОЧИСТКА (УДАЛЯЕМ СТАРЫЕ ТАБЛИЦЫ)
-- ═══════════════════════════════════════════════════════════════

-- Отключаем RLS чтобы можно было удалить
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can read other users emails for referrals" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON courses;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON courses;
DROP POLICY IF EXISTS "Enable update for users based on email" ON courses;

-- Удаляем таблицы в правильном порядке (от зависимых к независимым)
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS withdrawal_requests CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Удаляем старые функции
DROP FUNCTION IF EXISTS generate_referral_code() CASCADE;
DROP FUNCTION IF EXISTS auto_generate_referral_code() CASCADE;
DROP FUNCTION IF EXISTS credit_referral_bonus(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_referral_record(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS refund_withdrawal(UUID, DECIMAL) CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- ЧАСТЬ 2: СОЗДАНИЕ ОСНОВНЫХ ТАБЛИЦ
-- ═══════════════════════════════════════════════════════════════

-- Таблица пользователей
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  -- Реферальная система
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_referrals INTEGER DEFAULT 0,
  paid_referrals INTEGER DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица курсов
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_url TEXT,
  is_free BOOLEAN DEFAULT false,
  price DECIMAL(10,2) DEFAULT 0,
  stripe_price_id TEXT,
  instructor_id UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица уроков
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Хранит блоки урока
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id, order_index)
);

-- Таблица записей на курсы
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Таблица прогресса
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  last_accessed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Таблица запросов на вывод средств
CREATE TABLE withdrawal_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  admin_notes TEXT
);

-- Таблица рефералов
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered',
  reward_amount DECIMAL(10,2) DEFAULT 50.00,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- ═══════════════════════════════════════════════════════════════
-- ЧАСТЬ 3: ИНДЕКСЫ ДЛЯ БЫСТРОГО ПОИСКА
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_is_published ON courses(is_published);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);

CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(course_id, order_index);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_lesson ON user_progress(lesson_id);

CREATE INDEX idx_withdrawal_status ON withdrawal_requests(status);
CREATE INDEX idx_withdrawal_user ON withdrawal_requests(user_id);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_status ON referrals(status);

-- ═══════════════════════════════════════════════════════════════
-- ЧАСТЬ 4: ФУНКЦИИ ДЛЯ РЕФЕРАЛЬНОЙ СИСТЕМЫ
-- ═══════════════════════════════════════════════════════════════

-- Функция генерации уникального реферального кода
CREATE OR REPLACE FUNCTION generate_referral_code() 
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматической генерации кода при создании пользователя
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_referral_code
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION auto_generate_referral_code();

-- Функция начисления бонуса
CREATE OR REPLACE FUNCTION credit_referral_bonus(referred_user_id UUID)
RETURNS VOID AS $$
DECLARE
  referrer_code TEXT;
  referrer_user_id UUID;
  reward DECIMAL(10,2) := 50.00;
BEGIN
  SELECT referred_by INTO referrer_code 
  FROM users 
  WHERE id = referred_user_id;
  
  IF referrer_code IS NOT NULL THEN
    SELECT id INTO referrer_user_id 
    FROM users 
    WHERE referral_code = referrer_code;
    
    IF referrer_user_id IS NOT NULL THEN
      UPDATE users 
      SET balance = balance + reward,
          paid_referrals = paid_referrals + 1
      WHERE id = referrer_user_id;
      
      UPDATE referrals
      SET status = 'paid',
          paid_at = NOW()
      WHERE referrer_id = referrer_user_id 
        AND referred_id = referred_user_id
        AND status = 'registered';
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Функция создания записи реферала
CREATE OR REPLACE FUNCTION create_referral_record(p_referral_code TEXT, p_referred_id UUID)
RETURNS VOID AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  SELECT id INTO v_referrer_id
  FROM users
  WHERE referral_code = p_referral_code;
  
  IF v_referrer_id IS NOT NULL AND v_referrer_id != p_referred_id THEN
    INSERT INTO referrals (referrer_id, referred_id, status, created_at)
    VALUES (v_referrer_id, p_referred_id, 'registered', NOW())
    ON CONFLICT (referrer_id, referred_id) DO NOTHING;
    
    UPDATE users 
    SET total_referrals = total_referrals + 1
    WHERE id = v_referrer_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Функция возврата средств
CREATE OR REPLACE FUNCTION refund_withdrawal(p_user_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET balance = balance + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- ЧАСТЬ 5: RLS ПОЛИТИКИ (БЕЗОПАСНОСТЬ)
-- ═══════════════════════════════════════════════════════════════

-- Включаем RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Политики для users
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read other users emails for referrals"
ON users FOR SELECT
USING (true);

-- Политики для courses (все могут читать, админ может создавать/изменять)
CREATE POLICY "Enable read access for all users"
ON courses FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON courses FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for users based on email"
ON courses FOR UPDATE
USING (auth.uid() = instructor_id OR 
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'kmak4551@gmail.com'));

-- Политики для lessons (все могут читать опубликованные)
CREATE POLICY "Enable read access for all users"
ON lessons FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON lessons FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Политики для enrollments
CREATE POLICY "Users can read own enrollments"
ON enrollments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own enrollments"
ON enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Политики для user_progress
CREATE POLICY "Users can read own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON user_progress FOR ALL
USING (auth.uid() = user_id);

-- Политики для withdrawal_requests
CREATE POLICY "Users can read own withdrawal requests"
ON withdrawal_requests FOR SELECT
USING (auth.uid() = user_id OR 
       EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'kmak4551@gmail.com'));

CREATE POLICY "Users can create own withdrawal requests"
ON withdrawal_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Политики для referrals
CREATE POLICY "Users can read own referrals"
ON referrals FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ═══════════════════════════════════════════════════════════════
-- ЧАСТЬ 6: ГЕНЕРАЦИЯ КОДОВ ДЛЯ СУЩЕСТВУЮЩИХ ПОЛЬЗОВАТЕЛЕЙ
-- ═══════════════════════════════════════════════════════════════

-- Создаём записи в users для всех пользователей из auth.users
INSERT INTO users (id, email, created_at)
SELECT 
    id,
    email,
    created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Генерируем коды для всех кто без кода
UPDATE users
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- ═══════════════════════════════════════════════════════════════
-- ЧАСТЬ 7: ПРОВЕРКА РЕЗУЛЬТАТА
-- ═══════════════════════════════════════════════════════════════

-- Показываем созданные таблицы
SELECT 
    tablename,
    schemaname
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Показываем пользователей с кодами
SELECT 
    id,
    email,
    referral_code,
    balance,
    total_referrals,
    created_at
FROM users
ORDER BY created_at DESC;

-- Показываем функции
SELECT 
    proname as function_name
FROM pg_proc
WHERE proname LIKE '%referral%'
ORDER BY proname;

-- Показываем политики
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ═══════════════════════════════════════════════════════════════
-- ✅ ГОТОВО! ВСЁ СОЗДАНО!
-- ═══════════════════════════════════════════════════════════════
