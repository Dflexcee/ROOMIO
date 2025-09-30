-- Simple Verification System Setup (NO FOREIGN KEYS)
-- Run this in phpMyAdmin → roomio database → SQL tab

-- 1. First, let's see what we have in the users table
SELECT 'Current users table structure:' as info;
DESCRIBE users;

-- 2. Add verification columns to users table (if they don't exist)
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `verification_status` enum('unverified','pending','verified','rejected','suspended') DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS `account_type` enum('student','tenant','landlord','agent','individual') DEFAULT 'tenant';

-- 3. Create verification_requests table (NO FOREIGN KEYS)
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
    `status` enum('pending','approved','rejected','suspended') DEFAULT 'pending',
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

-- 4. Create verification_messages table (NO FOREIGN KEYS)
CREATE TABLE IF NOT EXISTS `verification_messages` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `verification_request_id` int(11) NOT NULL,
    `from_admin_id` int(11) NOT NULL,
    `to_user_id` int(11) NOT NULL,
    `message` text NOT NULL,
    `message_type` enum('approval','rejection','suspension','request_info','general') DEFAULT 'general',
    `is_read` tinyint(1) DEFAULT 0,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `verification_request_id` (`verification_request_id`),
    KEY `from_admin_id` (`from_admin_id`),
    KEY `to_user_id` (`to_user_id`),
    KEY `is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Add verification_request_id to users table
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `verification_request_id` int(11) DEFAULT NULL;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_users_verification_status` ON `users` (`verification_status`);
CREATE INDEX IF NOT EXISTS `idx_users_account_type` ON `users` (`account_type`);

-- 7. Show what we created
SELECT 'Verification tables created successfully!' as info;
SHOW TABLES LIKE '%verification%';

-- 8. Show table structures
SELECT 'verification_requests table structure:' as info;
DESCRIBE verification_requests;

SELECT 'verification_messages table structure:' as info;
DESCRIBE verification_messages;

SELECT 'Updated users table structure:' as info;
DESCRIBE users;

-- 9. Insert a test verification request (optional)
INSERT INTO `verification_requests` (
    `user_id`, `account_type`, `full_name`, `phone`, 
    `government_id_type`, `government_id_number`, `nin`, 
    `status`, `created_at`
) VALUES (
    1, 'landlord', 'Test User', '+234-123-456-7890',
    'national_id', '12345678901', '12345678901',
    'pending', NOW()
);

-- 10. Show the test data
SELECT 'Test verification request created:' as info;
SELECT * FROM verification_requests WHERE user_id = 1;
