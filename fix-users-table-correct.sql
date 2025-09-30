-- Fix users table based on Supabase structure
-- Run this SQL to add the missing columns that match Supabase

-- Add status column if it doesn't exist (active, suspended, banned)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Add is_verified column if it doesn't exist (0 or 1)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_verified TINYINT(1) DEFAULT 0;

-- Add email_confirmed column if it doesn't exist (0 or 1)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_confirmed TINYINT(1) DEFAULT 0;

-- Add university column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS university VARCHAR(255) DEFAULT '';

-- Add department column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS department VARCHAR(255) DEFAULT '';

-- Update existing users to have proper values
UPDATE users SET status = 'active' WHERE status IS NULL OR status = '';
UPDATE users SET is_verified = 1 WHERE is_verified IS NULL;
UPDATE users SET email_confirmed = 1 WHERE email_confirmed IS NULL;
UPDATE users SET university = '' WHERE university IS NULL;
UPDATE users SET department = '' WHERE department IS NULL;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id INT PRIMARY KEY,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Show the updated table structure
DESCRIBE users;
DESCRIBE profiles;
