-- Fix users table - Add missing columns for admin functionality
-- Run this SQL to add the missing columns

-- Add verification_status column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified';

-- Add account_type column if it doesn't exist  
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'active';

-- Update existing users to have proper values
UPDATE users SET verification_status = 'verified' WHERE verification_status IS NULL OR verification_status = '';
UPDATE users SET account_type = 'active' WHERE account_type IS NULL OR account_type = '';

-- Show the updated table structure
DESCRIBE users;
