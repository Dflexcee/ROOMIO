-- Create listings table for multi-property posts
-- Run this in phpMyAdmin SQL tab for roomio database

CREATE TABLE IF NOT EXISTS `listings` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `type` ENUM('land', 'house', 'car', 'other') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(12,2) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `images` JSON COMMENT 'Array of image URLs',
    `specifications` JSON COMMENT 'Type-specific data (size, bedrooms, mileage, etc)',
    `contact_phone` VARCHAR(50),
    `contact_email` VARCHAR(255),
    `status` ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
    `status_reason` TEXT COMMENT 'Admin reason for rejection/suspension',
    `status_changed_by` INT UNSIGNED COMMENT 'Admin user ID who changed status',
    `status_changed_at` TIMESTAMP NULL,
    `views` INT UNSIGNED DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY `idx_user_id` (`user_id`),
    KEY `idx_type` (`type`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '✅ Listings table created successfully!' as status;