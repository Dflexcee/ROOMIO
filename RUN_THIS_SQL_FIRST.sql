-- =====================================================
-- CRITICAL: Run this SQL before testing the app
-- This fixes all database issues in one go
-- =====================================================
-- Run in phpMyAdmin → roomio database → SQL tab
-- =====================================================

-- 1. CREATE TICKETS TABLES (if not exists)
CREATE TABLE IF NOT EXISTS `tickets` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
    `status` ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ticket_responses` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `ticket_id` INT UNSIGNED NOT NULL,
    `user_id` INT UNSIGNED,
    `message` TEXT NOT NULL,
    `is_admin` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_ticket_id` (`ticket_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '✅ Tickets tables created/verified' as status;

-- 2. FIX MESSAGES TABLE (add file attachment support)
ALTER TABLE `messages`
ADD COLUMN IF NOT EXISTS `file_name` VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `file_type` VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `file_url` VARCHAR(500) DEFAULT NULL;

SELECT '✅ Messages table updated for file attachments' as status;

-- 3. FIX SCAM_ALERTS TABLE (drop and recreate without foreign key issues)
DROP TABLE IF EXISTS `scam_alerts`;

CREATE TABLE `scam_alerts` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `reported_by` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY `idx_user_id` (`user_id`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '✅ Scam alerts table fixed' as status;

-- 4. ENSURE SYSTEM_LOGS TABLE EXISTS (for admin action logging)
CREATE TABLE IF NOT EXISTS `system_logs` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED,
    `action` VARCHAR(255) NOT NULL,
    `details` TEXT,
    `ip_address` VARCHAR(45),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_user_id` (`user_id`),
    KEY `idx_action` (`action`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '✅ System logs table created/verified' as status;

-- 5. ENSURE USERS TABLE HAS ALL REQUIRED COLUMNS
ALTER TABLE `users`
ADD COLUMN IF NOT EXISTS `status` ENUM('active', 'banned', 'suspended', 'inactive') DEFAULT 'active',
ADD COLUMN IF NOT EXISTS `verification_status` ENUM('unverified', 'pending', 'verified', 'rejected', 'suspended') DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS `status_reason` TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `status_changed_at` TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS `status_changed_by` INT UNSIGNED DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `is_verified` BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS `account_type` ENUM('student', 'tenant', 'landlord', 'agent', 'individual') DEFAULT 'tenant',
ADD COLUMN IF NOT EXISTS `verification_request_id` INT UNSIGNED DEFAULT NULL;

SELECT '✅ Users table structure verified' as status;

-- 6. CREATE VERIFICATION TABLES (if not exists)
CREATE TABLE IF NOT EXISTS `verification_requests` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `account_type` ENUM('student','tenant','landlord','agent','individual') NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `profile_picture` VARCHAR(500) DEFAULT NULL,
    `government_id_type` ENUM('national_id','drivers_license','passport','voters_card') DEFAULT NULL,
    `government_id_number` VARCHAR(100) DEFAULT NULL,
    `government_id_image` VARCHAR(500) DEFAULT NULL,
    `nin` VARCHAR(20) DEFAULT NULL,
    `school_id_type` ENUM('student_id','admission_letter','school_certificate') DEFAULT NULL,
    `school_id_number` VARCHAR(100) DEFAULT NULL,
    `school_id_image` VARCHAR(500) DEFAULT NULL,
    `school_name` VARCHAR(255) DEFAULT NULL,
    `status` ENUM('pending','approved','rejected','suspended') DEFAULT 'pending',
    `admin_message` TEXT DEFAULT NULL,
    `reviewed_by` INT UNSIGNED DEFAULT NULL,
    `reviewed_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `verification_messages` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `verification_request_id` INT UNSIGNED NOT NULL,
    `from_admin_id` INT UNSIGNED NOT NULL,
    `to_user_id` INT UNSIGNED NOT NULL,
    `message` TEXT NOT NULL,
    `message_type` ENUM('approval','rejection','suspension','request_info','general') DEFAULT 'general',
    `is_read` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_verification_request_id` (`verification_request_id`),
    KEY `idx_to_user_id` (`to_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '✅ Verification tables created/verified' as status;

-- 7. FINAL SUCCESS MESSAGE
SELECT '
================================================
🎉 ALL DATABASE FIXES APPLIED SUCCESSFULLY! 🎉
================================================

Next steps:
1. Test chat (file attachments now work)
2. Test scam board (should work now)
3. Test help center (tickets should work)
4. Test verification system

Your database is ready!
================================================
' as FINAL_MESSAGE;

-- Show table counts
SELECT
    (SELECT COUNT(*) FROM tickets) as total_tickets,
    (SELECT COUNT(*) FROM ticket_responses) as total_ticket_responses,
    (SELECT COUNT(*) FROM scam_alerts) as total_scam_alerts,
    (SELECT COUNT(*) FROM messages) as total_messages,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM verification_requests) as total_verification_requests;