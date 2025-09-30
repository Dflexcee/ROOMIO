-- Fix users table - Safe version with IF EXISTS checks
-- Run this SQL to add the missing columns safely

-- Add status column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'status') = 0,
    'ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT "active"',
    'SELECT "Column status already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add is_verified column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'is_verified') = 0,
    'ALTER TABLE users ADD COLUMN is_verified TINYINT(1) DEFAULT 0',
    'SELECT "Column is_verified already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add email_confirmed column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'email_confirmed') = 0,
    'ALTER TABLE users ADD COLUMN email_confirmed TINYINT(1) DEFAULT 0',
    'SELECT "Column email_confirmed already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add university column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'university') = 0,
    'ALTER TABLE users ADD COLUMN university VARCHAR(255) DEFAULT ""',
    'SELECT "Column university already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add department column if it doesn't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND COLUMN_NAME = 'department') = 0,
    'ALTER TABLE users ADD COLUMN department VARCHAR(255) DEFAULT ""',
    'SELECT "Column department already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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
