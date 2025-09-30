-- Fix scam_alerts table structure
-- Run this in phpMyAdmin → roomio database → SQL tab

-- Option 1: Drop and recreate table (if no important data)
DROP TABLE IF EXISTS `scam_alerts`;

CREATE TABLE `scam_alerts` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `reported_by` VARCHAR(255) NOT NULL,  -- Email of reporter
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    KEY `idx_user_id` (`user_id`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Success message
SELECT 'Scam alerts table fixed successfully!' as message;
DESCRIBE scam_alerts;