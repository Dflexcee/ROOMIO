-- Currency Settings Table
-- Run this in phpMyAdmin → roomio database → SQL tab

-- Create currency_settings table
CREATE TABLE IF NOT EXISTS currency_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    currency_code VARCHAR(3) NOT NULL UNIQUE,
    currency_name VARCHAR(50) NOT NULL,
    currency_symbol VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default currencies
INSERT INTO currency_settings (currency_code, currency_name, currency_symbol, is_active, is_default) VALUES
('USD', 'US Dollar', '$', TRUE, TRUE),
('EUR', 'Euro', '€', TRUE, FALSE),
('GBP', 'British Pound', '£', TRUE, FALSE),
('NGN', 'Nigerian Naira', '₦', TRUE, FALSE),
('CNY', 'Chinese Yuan', '¥', TRUE, FALSE),
('MXN', 'Mexican Peso', '$', TRUE, FALSE),
('JPY', 'Japanese Yen', '¥', TRUE, FALSE),
('CAD', 'Canadian Dollar', '$', TRUE, FALSE),
('AUD', 'Australian Dollar', '$', TRUE, FALSE),
('INR', 'Indian Rupee', '₹', TRUE, FALSE),
('BRL', 'Brazilian Real', 'R$', TRUE, FALSE),
('ZAR', 'South African Rand', 'R', TRUE, FALSE);

-- Create system_settings table for current currency
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default currency setting
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('default_currency', 'NGN', 'Default currency for the application'),
('currency_display_format', 'symbol_amount', 'How to display currency: symbol_amount, amount_symbol, or code_amount');

-- Show the created tables
DESCRIBE currency_settings;
DESCRIBE system_settings;
