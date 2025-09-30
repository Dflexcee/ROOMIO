-- Add status reason columns to users table
-- Run this in phpMyAdmin → roomio database → SQL tab

-- Add status_reason column to store the reason for status changes
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status_reason TEXT DEFAULT NULL;

-- Add status_changed_at column to track when status was last changed
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMP NULL;

-- Add status_changed_by column to track who changed the status
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status_changed_by INT DEFAULT NULL;

-- Add avatar_url column if it doesn't exist for profile pictures
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT NULL;

-- Add more profile fields if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS age INT DEFAULT NULL;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender ENUM('male','female','other') DEFAULT NULL;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS about_me TEXT DEFAULT NULL;

-- Show the updated table structure
DESCRIBE users;
