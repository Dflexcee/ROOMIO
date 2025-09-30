-- Verification System Database Setup
-- Run this in phpMyAdmin → roomio database → SQL tab

-- 1. Create verification_requests table
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
    KEY `account_type` (`account_type`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Create verification_messages table for admin-user communication
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
    KEY `is_read` (`is_read`),
    FOREIGN KEY (`verification_request_id`) REFERENCES `verification_requests` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`from_admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Add verification status to users table if not exists
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `verification_status` enum('unverified','pending','verified','rejected') DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS `verification_request_id` int(11) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `account_type` enum('student','tenant','landlord','agent','individual') DEFAULT 'tenant';

-- Add foreign key for verification_request_id
ALTER TABLE `users` 
ADD CONSTRAINT `fk_users_verification_request` 
FOREIGN KEY (`verification_request_id`) REFERENCES `verification_requests` (`id`) ON DELETE SET NULL;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_users_verification_status` ON `users` (`verification_status`);
CREATE INDEX IF NOT EXISTS `idx_users_account_type` ON `users` (`account_type`);

-- 5. Insert sample verification request (optional - for testing)
-- INSERT INTO `verification_requests` (
--     `user_id`, `account_type`, `full_name`, `phone`, 
--     `government_id_type`, `government_id_number`, `nin`, 
--     `status`, `created_at`
-- ) VALUES (
--     1, 'landlord', 'John Doe', '+234-123-456-7890',
--     'national_id', '12345678901', '12345678901',
--     'pending', NOW()
-- );

-- Show the created tables
SHOW TABLES LIKE '%verification%';
DESCRIBE verification_requests;
DESCRIBE verification_messages;
