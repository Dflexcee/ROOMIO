-- Fix scam_alerts table foreign key issues
-- Run this in phpMyAdmin SQL tab for roomio database

DROP TABLE IF EXISTS `scam_alerts`;

CREATE TABLE `scam_alerts` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `reported_by` VARCHAR(255) NOT NULL COMMENT 'User email who reported',
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('pending', 'reviewing', 'verified', 'dismissed') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '✅ Scam alerts table fixed!' as status;