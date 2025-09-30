-- Verification System Database Setup (FIXED VERSION)
-- Run this in phpMyAdmin → roomio database → SQL tab

-- 1. First, let's check what columns exist in the users table
-- This will help us understand the current structure
SELECT 'Checking users table structure:' as info;
DESCRIBE users;

-- 2. Add verification columns to users table if they don't exist
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `verification_status` enum('unverified','pending','verified','rejected') DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS `account_type` enum('student','tenant','landlord','agent','individual') DEFAULT 'tenant';

-- 3. Create verification_requests table (without foreign keys first)
CREATE TABLE IF NOT EXISTS `verification_requests` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL,
    `account_type` enum('student','tenant','landlord','agent','individual') NOT NULL,
    `full_name` varchar(255) NOT NULL,
    `phone` varchar(20) NOT NULL,
    `profile_picture` varchar(500) DEFAULT NULL,
    `government_id_type` enum('national_id','drivers_license','passport','voters_card') DEFAULT NULL,
    `government_id_number` varchar(100) DEFAULT NULL,
    `government_id_image` varchar(500) DEFAULT NULL,
    `nin` varchar(20) DEFAULT NULL,
    `school_id_type` enum('student_id','admission_letter','school_certificate') DEFAULT NULL,
    `school_id_number` varchar(100) DEFAULT NULL,
    `school_id_image` varchar(500) DEFAULT NULL,
    `school_name` varchar(255) DEFAULT NULL,
    `status` enum('pending','approved','rejected') DEFAULT 'pending',
    `admin_message` text DEFAULT NULL,
    `reviewed_by` int(11) DEFAULT NULL,
    `reviewed_at` timestamp NULL DEFAULT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    KEY `status` (`status`),
    KEY `account_type` (`account_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Create verification_messages table (without foreign keys first)
CREATE TABLE IF NOT EXISTS `verification_messages` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `verification_request_id` int(11) NOT NULL,
    `from_admin_id` int(11) NOT NULL,
    `to_user_id` int(11) NOT NULL,
    `message` text NOT NULL,
    `message_type` enum('approval','rejection','request_info','general') DEFAULT 'general',
    `is_read` tinyint(1) DEFAULT 0,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `verification_request_id` (`verification_request_id`),
    KEY `from_admin_id` (`from_admin_id`),
    KEY `to_user_id` (`to_user_id`),
    KEY `is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Now add foreign keys (only if the referenced tables exist and have the right structure)
-- Check if we can add foreign keys safely
SELECT 'Adding foreign keys...' as info;

-- Add foreign key for verification_requests.user_id
ALTER TABLE `verification_requests` 
ADD CONSTRAINT `fk_verification_requests_user_id` 
FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- Add foreign key for verification_requests.reviewed_by
ALTER TABLE `verification_requests` 
ADD CONSTRAINT `fk_verification_requests_reviewed_by` 
FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- Add foreign keys for verification_messages
ALTER TABLE `verification_messages` 
ADD CONSTRAINT `fk_verification_messages_request_id` 
FOREIGN KEY (`verification_request_id`) REFERENCES `verification_requests` (`id`) ON DELETE CASCADE;

ALTER TABLE `verification_messages` 
ADD CONSTRAINT `fk_verification_messages_from_admin` 
FOREIGN KEY (`from_admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `verification_messages` 
ADD CONSTRAINT `fk_verification_messages_to_user` 
FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- 6. Add verification_request_id to users table
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `verification_request_id` int(11) DEFAULT NULL;

-- Add foreign key for users.verification_request_id
ALTER TABLE `users` 
ADD CONSTRAINT `fk_users_verification_request` 
FOREIGN KEY (`verification_request_id`) REFERENCES `verification_requests` (`id`) ON DELETE SET NULL;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_users_verification_status` ON `users` (`verification_status`);
CREATE INDEX IF NOT EXISTS `idx_users_account_type` ON `users` (`account_type`);

-- 8. Show the created tables
SELECT 'Verification tables created successfully!' as info;
SHOW TABLES LIKE '%verification%';

-- 9. Show table structures
DESCRIBE verification_requests;
DESCRIBE verification_messages;

-- 10. Show updated users table structure
SELECT 'Updated users table structure:' as info;
DESCRIBE users;
