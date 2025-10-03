-- ==============================================================================
-- COMPLETE DATABASE SETUP AND FIXES
-- Run this ONCE in phpMyAdmin → roomio database → SQL tab
-- This fixes all errors and sets up new features
-- ==============================================================================

-- 1. FIX MESSAGES TABLE (for chat file attachments)
-- Check and add columns if they don't exist
SET @exist_file_name := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'roomio' AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'file_name');

SET @sql := IF(@exist_file_name = 0,
    'ALTER TABLE messages ADD COLUMN file_name VARCHAR(255) DEFAULT NULL, ADD COLUMN file_type VARCHAR(100) DEFAULT NULL, ADD COLUMN file_url VARCHAR(500) DEFAULT NULL',
    'SELECT "Messages file columns already exist" as message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ Step 1: Messages table fixed for file attachments' as status;

-- 2. FIX SCAM_ALERTS TABLE (foreign key issues)
DROP TABLE IF EXISTS `scam_alerts`;

CREATE TABLE `scam_alerts` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `reported_by` VARCHAR(255) NOT NULL COMMENT 'User email',
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('pending', 'reviewing', 'verified', 'dismissed') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '✅ Step 2: Scam alerts table fixed' as status;

-- 3. CREATE LISTINGS TABLE (new feature for multi-property posts)
CREATE TABLE IF NOT EXISTS `listings` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `type` ENUM('land', 'house', 'car', 'other') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(12,2) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `images` JSON COMMENT 'Array of image URLs',
    `specifications` JSON COMMENT 'Type-specific data',
    `contact_phone` VARCHAR(50),
    `contact_email` VARCHAR(255),
    `status` ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
    `status_reason` TEXT,
    `status_changed_by` INT UNSIGNED,
    `status_changed_at` TIMESTAMP NULL,
    `views` INT UNSIGNED DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY `idx_user_id` (`user_id`),
    KEY `idx_type` (`type`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '✅ Step 3: Listings table created' as status;

-- 4. ADD STATUS FIELDS TO ROOMS TABLE (if missing)
SET @exist_status_reason := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'roomio' AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'status_reason');

SET @sql2 := IF(@exist_status_reason = 0,
    'ALTER TABLE rooms ADD COLUMN status_reason TEXT, ADD COLUMN status_changed_by INT UNSIGNED, ADD COLUMN status_changed_at TIMESTAMP NULL',
    'SELECT "Rooms status columns already exist" as message');

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

SELECT '✅ Step 4: Rooms table updated with status tracking' as status;

-- 5. CREATE SMTP SETTINGS TABLE (if not exists)
CREATE TABLE IF NOT EXISTS `smtp_settings` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `host` VARCHAR(255) NOT NULL,
    `port` INT NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `encryption` ENUM('tls', 'ssl', 'none') DEFAULT 'tls',
    `from_email` VARCHAR(255) NOT NULL,
    `from_name` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '✅ Step 5: SMTP settings table created' as status;

-- 6. CREATE SMS SETTINGS TABLE (if not exists)
CREATE TABLE IF NOT EXISTS `sms_settings` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `provider` ENUM('twilio', 'nexmo', 'other') NOT NULL,
    `account_sid` VARCHAR(255),
    `auth_token` VARCHAR(255),
    `from_number` VARCHAR(50),
    `api_key` VARCHAR(255),
    `api_secret` VARCHAR(255),
    `is_active` BOOLEAN DEFAULT TRUE,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '✅ Step 6: SMS settings table created' as status;

-- 7. CREATE EMAIL TEMPLATES TABLE (if not exists)
CREATE TABLE IF NOT EXISTS `email_templates` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `subject` VARCHAR(255) NOT NULL,
    `body` TEXT NOT NULL,
    `variables` JSON COMMENT 'Available template variables',
    `description` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default templates
INSERT IGNORE INTO `email_templates` (`name`, `subject`, `body`, `variables`, `description`) VALUES
('ticket_created', 'New Support Ticket #{ticket_id}',
'Hello {user_name},\n\nYour support ticket has been created.\n\nSubject: {subject}\nTicket ID: {ticket_id}\n\nWe will respond as soon as possible.\n\nBest regards,\nRoomio Support',
'["user_name", "subject", "ticket_id"]',
'Sent to user when they create a ticket'),

('ticket_reply', 'Reply to Ticket #{ticket_id}',
'Hello {user_name},\n\nYou have received a reply to your ticket.\n\nSubject: {subject}\nReply: {message}\n\nView ticket: {ticket_url}\n\nBest regards,\nRoomio Support',
'["user_name", "subject", "ticket_id", "message", "ticket_url"]',
'Sent when someone replies to a ticket'),

('listing_approved', 'Your Listing Has Been Approved',
'Hello {user_name},\n\nCongratulations! Your listing "{listing_title}" has been approved and is now live.\n\nView listing: {listing_url}\n\nBest regards,\nRoomio Team',
'["user_name", "listing_title", "listing_url"]',
'Sent when admin approves a listing'),

('listing_rejected', 'Your Listing Requires Changes',
'Hello {user_name},\n\nYour listing "{listing_title}" could not be approved.\n\nReason: {reason}\n\nPlease edit and resubmit.\n\nBest regards,\nRoomio Team',
'["user_name", "listing_title", "reason"]',
'Sent when admin rejects a listing');

SELECT '✅ Step 7: Email templates created with defaults' as status;

-- ==============================================================================
-- ALL DONE!
-- ==============================================================================
SELECT '
🎉 DATABASE SETUP COMPLETE! 🎉

What was fixed/created:
- Messages table (file attachments)
- Scam alerts table (fixed foreign keys)
- Listings table (new multi-property feature)
- Rooms table (status tracking)
- SMTP settings table
- SMS settings table
- Email templates (with 4 defaults)

Next steps:
1. Refresh your app (Ctrl+F5)
2. Test chat (should work now)
3. Test scam board (should work now)
4. Check implementation plan (IMPLEMENTATION_PLAN.md)
' as FINAL_STATUS;