-- ⚠️ ЕСЛИ У ВАС ТАБЛИЦА НАЗЫВАЕТСЯ profiles, А НЕ users, ИСПОЛЬЗУЙТЕ ЭТОТ СКРИПТ!

-- Добавляем поля для реферальной системы в таблицу profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by TEXT,
ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_referrals INTEGER DEFAULT 0;

-- Создаём таблицу для запросов на вывод денег
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  admin_notes TEXT
);

-- Создаём таблицу для отслеживания рефералов
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered',
  reward_amount DECIMAL(10,2) DEFAULT 50.00,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_withdrawal_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Функция для генерации уникального реферального кода
CREATE OR REPLACE FUNCTION generate_referral_code() 
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматической генерации реферального кода
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_referral_code ON profiles;
CREATE TRIGGER trigger_generate_referral_code
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION auto_generate_referral_code();

-- Функция для начисления бонуса
CREATE OR REPLACE FUNCTION credit_referral_bonus(referred_user_id UUID)
RETURNS VOID AS $$
DECLARE
  referrer_code TEXT;
  referrer_user_id UUID;
  reward DECIMAL(10,2) := 50.00;
BEGIN
  SELECT referred_by INTO referrer_code 
  FROM profiles 
  WHERE id = referred_user_id;
  
  IF referrer_code IS NOT NULL THEN
    SELECT id INTO referrer_user_id 
    FROM profiles 
    WHERE referral_code = referrer_code;
    
    IF referrer_user_id IS NOT NULL THEN
      UPDATE profiles 
      SET balance = balance + reward,
          paid_referrals = paid_referrals + 1
      WHERE id = referrer_user_id;
      
      UPDATE referrals
      SET status = 'paid',
          paid_at = NOW()
      WHERE referrer_id = referrer_user_id 
        AND referred_id = referred_user_id
        AND status = 'registered';
        
      INSERT INTO referrals (referrer_id, referred_id, status, reward_amount, paid_at)
      VALUES (referrer_user_id, referred_user_id, 'paid', reward, NOW())
      ON CONFLICT (referrer_id, referred_id) DO NOTHING;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Функция для создания записи реферала
CREATE OR REPLACE FUNCTION create_referral_record(p_referral_code TEXT, p_referred_id UUID)
RETURNS VOID AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  SELECT id INTO v_referrer_id
  FROM profiles
  WHERE referral_code = p_referral_code;
  
  IF v_referrer_id IS NOT NULL AND v_referrer_id != p_referred_id THEN
    INSERT INTO referrals (referrer_id, referred_id, status, created_at)
    VALUES (v_referrer_id, p_referred_id, 'registered', NOW())
    ON CONFLICT (referrer_id, referred_id) DO NOTHING;
    
    UPDATE profiles 
    SET total_referrals = total_referrals + 1
    WHERE id = v_referrer_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Функция для возврата средств
CREATE OR REPLACE FUNCTION refund_withdrawal(p_user_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET balance = balance + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ⚠️ ВАЖНО: Генерируем реферальные коды для ВСЕХ существующих пользователей
UPDATE profiles
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- Проверяем результат
SELECT COUNT(*) as total_users, 
       COUNT(referral_code) as users_with_code
FROM profiles;
