-- Добавляем поля для реферальной системы в таблицу users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES users(referral_code),
ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_referrals INTEGER DEFAULT 0;

-- Создаём таблицу для запросов на вывод денег
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL, -- 'card_ua', 'card_ru', 'bank_uk'
  payment_details JSONB NOT NULL, -- {cardNumber: "...", etc}
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  admin_notes TEXT
);

-- Создаём таблицу для отслеживания рефералов
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered', -- 'registered', 'paid'
  reward_amount DECIMAL(10,2) DEFAULT 50.00,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
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
    -- Генерируем случайный код из 8 символов
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Проверяем уникальность
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматической генерации реферального кода при регистрации
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
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION auto_generate_referral_code();

-- Функция для начисления бонуса при оплате реферала
CREATE OR REPLACE FUNCTION credit_referral_bonus(referred_user_id UUID)
RETURNS VOID AS $$
DECLARE
  referrer_code TEXT;
  referrer_user_id UUID;
  reward DECIMAL(10,2) := 50.00;
BEGIN
  -- Получаем реферальный код реферера
  SELECT referred_by INTO referrer_code 
  FROM users 
  WHERE id = referred_user_id;
  
  IF referrer_code IS NOT NULL THEN
    -- Получаем ID реферера
    SELECT id INTO referrer_user_id 
    FROM users 
    WHERE referral_code = referrer_code;
    
    IF referrer_user_id IS NOT NULL THEN
      -- Начисляем бонус рефереру
      UPDATE users 
      SET balance = balance + reward,
          paid_referrals = paid_referrals + 1
      WHERE id = referrer_user_id;
      
      -- Обновляем статус реферала
      UPDATE referrals
      SET status = 'paid',
          paid_at = NOW()
      WHERE referrer_id = referrer_user_id 
        AND referred_id = referred_user_id
        AND status = 'registered';
        
      -- Если записи нет, создаём
      INSERT INTO referrals (referrer_id, referred_id, status, reward_amount, paid_at)
      VALUES (referrer_user_id, referred_user_id, 'paid', reward, NOW())
      ON CONFLICT (referrer_id, referred_id) DO NOTHING;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Функция для создания записи реферала при регистрации
CREATE OR REPLACE FUNCTION create_referral_record(p_referral_code TEXT, p_referred_id UUID)
RETURNS VOID AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  -- Находим ID реферера по коду
  SELECT id INTO v_referrer_id
  FROM users
  WHERE referral_code = p_referral_code;
  
  IF v_referrer_id IS NOT NULL AND v_referrer_id != p_referred_id THEN
    -- Создаём запись в referrals
    INSERT INTO referrals (referrer_id, referred_id, status, created_at)
    VALUES (v_referrer_id, p_referred_id, 'registered', NOW())
    ON CONFLICT (referrer_id, referred_id) DO NOTHING;
    
    -- Увеличиваем счётчик total_referrals
    UPDATE users 
    SET total_referrals = total_referrals + 1
    WHERE id = v_referrer_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Функция для возврата средств при отклонении заявки
CREATE OR REPLACE FUNCTION refund_withdrawal(p_user_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET balance = balance + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE withdrawal_requests IS 'Заявки на вывод средств из реферальной программы';
COMMENT ON TABLE referrals IS 'История рефералов и начислений';
COMMENT ON COLUMN users.referral_code IS 'Уникальный реферальный код пользователя';
COMMENT ON COLUMN users.referred_by IS 'Кто пригласил этого пользователя';
COMMENT ON COLUMN users.balance IS 'Баланс заработанных на рефералах денег';

-- ⚠️ ВАЖНО: Генерируем реферальные коды для существующих пользователей
UPDATE users
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;
