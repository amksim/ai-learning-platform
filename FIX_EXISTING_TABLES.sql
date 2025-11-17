-- ═══════════════════════════════════════════════════════════════
-- 🔧 ИСПРАВЛЕНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ═══════════════════════════════════════════════════════════════

-- Добавляем недостающие колонки в courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES users(id);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Добавляем недостающие колонки в users
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS paid_referrals INTEGER DEFAULT 0;

-- Создаём таблицы если их нет
CREATE TABLE IF NOT EXISTS withdrawal_requests (
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

CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered',
  reward_amount DECIMAL(10,2) DEFAULT 50.00,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_withdrawal_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Функция генерации кода
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

-- Триггер автогенерации
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_referral_code ON users;
CREATE TRIGGER trigger_generate_referral_code
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION auto_generate_referral_code();

-- Включаем RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Политики для users
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read other users emails for referrals" ON users;
CREATE POLICY "Users can read other users emails for referrals" ON users FOR SELECT USING (true);

-- Политики для courses
DROP POLICY IF EXISTS "Enable read access for all users" ON courses;
CREATE POLICY "Enable read access for all users" ON courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON courses;
CREATE POLICY "Enable insert for authenticated users only" ON courses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Enable update for users based on email" ON courses;
CREATE POLICY "Enable update for users based on email" ON courses FOR UPDATE 
USING (auth.uid() = instructor_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'kmak4551@gmail.com'));

-- Политики для withdrawal_requests
DROP POLICY IF EXISTS "Users can read own withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Users can read own withdrawal requests" ON withdrawal_requests FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'kmak4551@gmail.com'));

DROP POLICY IF EXISTS "Users can create own withdrawal requests" ON withdrawal_requests;
CREATE POLICY "Users can create own withdrawal requests" ON withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политики для referrals
DROP POLICY IF EXISTS "Users can read own referrals" ON referrals;
CREATE POLICY "Users can read own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Генерируем коды для всех кто без кодов
UPDATE users SET referral_code = generate_referral_code() WHERE referral_code IS NULL;

-- Проверка результата
SELECT 
    'УСПЕХ! Пользователи с кодами:' as status,
    COUNT(*) as total_users,
    COUNT(referral_code) as users_with_codes
FROM users;

-- Показываем пользователей
SELECT id, email, referral_code, balance, total_referrals FROM users ORDER BY created_at DESC LIMIT 5;
