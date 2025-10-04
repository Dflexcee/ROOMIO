-- Quick Fixes SQL
-- Run this file to ensure all database columns exist

-- 1. Ensure ID image columns exist in verification_requests
ALTER TABLE verification_requests
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500) NULL;

-- 2. Check if ads table exists, if not create it
CREATE TABLE IF NOT EXISTS popup_ads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link_url VARCHAR(500),
  link_text VARCHAR(100),
  image_url VARCHAR(500),
  is_active TINYINT(1) DEFAULT 1,
  target_audience ENUM('all', 'students', 'landlords', 'agents') DEFAULT 'all',
  start_date DATETIME,
  end_date DATETIME,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Ensure currency_settings table exists
CREATE TABLE IF NOT EXISTS currency_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  currency_code VARCHAR(10) NOT NULL DEFAULT 'NGN',
  currency_symbol VARCHAR(10) NOT NULL DEFAULT '₦',
  currency_name VARCHAR(50) NOT NULL DEFAULT 'Nigerian Naira',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default currency if table is empty
INSERT INTO currency_settings (currency_code, currency_symbol, currency_name)
SELECT 'NGN', '₦', 'Nigerian Naira'
WHERE NOT EXISTS (SELECT 1 FROM currency_settings);

-- Done! All tables ready
SELECT 'Database updated successfully!' as status;
