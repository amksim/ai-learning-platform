-- ═══════════════════════════════════════════════════════════════
-- ✅ ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ - ПРАВИЛЬНЫЙ ПОРЯДОК
-- ═══════════════════════════════════════════════════════════════

-- ШАГ 1: Создаём таблицу users СНАЧАЛА!
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_referrals INTEGER DEFAULT 0,
  paid_referrals INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ШАГ 2: Заполняем users из auth.users
INSERT INTO users (id, email, created_at)
SELECT id, email, created_at FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ШАГ 3: Добавляем колонки в courses (теперь users существует!)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES users(id);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ШАГ 4: Создаём остальные таблицы
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

-- ШАГ 5: Индексы
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_withdrawal_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- ШАГ 6: Функция генерации кода
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

-- ШАГ 7: Триггер
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

-- ШАГ 8: RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- ШАГ 9: Политики
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read other users" ON users;
CREATE POLICY "Users can read other users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "courses_read" ON courses;
CREATE POLICY "courses_read" ON courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "courses_insert" ON courses;
CREATE POLICY "courses_insert" ON courses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "courses_update" ON courses;
CREATE POLICY "courses_update" ON courses FOR UPDATE USING (
  auth.uid() = instructor_id OR 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'kmak4551@gmail.com')
);

DROP POLICY IF EXISTS "withdrawals_read" ON withdrawal_requests;
CREATE POLICY "withdrawals_read" ON withdrawal_requests FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND email = 'kmak4551@gmail.com')
);

DROP POLICY IF EXISTS "withdrawals_insert" ON withdrawal_requests;
CREATE POLICY "withdrawals_insert" ON withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "referrals_read" ON referrals;
CREATE POLICY "referrals_read" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ШАГ 10: Генерируем коды
UPDATE users SET referral_code = generate_referral_code() WHERE referral_code IS NULL;

-- ШАГ 11: ПРОВЕРКА
SELECT '✅ ГОТОВО!' as status;
SELECT COUNT(*) as total_users, COUNT(referral_code) as users_with_codes FROM users;
SELECT id, email, referral_code, balance FROM users ORDER BY created_at DESC;
