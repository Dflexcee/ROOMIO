-- Fix users table - Simple version without IF NOT EXISTS
-- Run this SQL to add the missing columns

-- Add status column
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- Add is_verified column  
ALTER TABLE users ADD COLUMN is_verified TINYINT(1) DEFAULT 0;

-- Add email_confirmed column
ALTER TABLE users ADD COLUMN email_confirmed TINYINT(1) DEFAULT 0;

-- Add university column
ALTER TABLE users ADD COLUMN university VARCHAR(255) DEFAULT '';

-- Add department column
ALTER TABLE users ADD COLUMN department VARCHAR(255) DEFAULT '';

-- Update existing users to have proper values
UPDATE users SET status = 'active' WHERE status IS NULL OR status = '';
UPDATE users SET is_verified = 1 WHERE is_verified IS NULL;
UPDATE users SET email_confirmed = 1 WHERE email_confirmed IS NULL;
UPDATE users SET university = '' WHERE university IS NULL;
UPDATE users SET department = '' WHERE department IS NULL;

-- Create profiles table
CREATE TABLE profiles (
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
