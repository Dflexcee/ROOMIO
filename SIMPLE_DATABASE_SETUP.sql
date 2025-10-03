-- ========================================
-- SIMPLE DATABASE SETUP - ROOMIO
-- Run this in phpMyAdmin (ignore errors for existing columns/tables)
-- ========================================

-- Step 1: Add columns to users table
ALTER TABLE `users` ADD COLUMN `full_name` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `phone` VARCHAR(20) DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `avatar_url` VARCHAR(500) DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `status` ENUM('active','inactive','banned','suspended') DEFAULT 'active';
ALTER TABLE `users` ADD COLUMN `verification_status` ENUM('unverified','pending','verified','approved','rejected') DEFAULT 'unverified';
ALTER TABLE `users` ADD COLUMN `status_reason` TEXT DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `gender` ENUM('male','female') DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `religion` VARCHAR(100) DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `lifestyle` VARCHAR(100) DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `university` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `budget_range` VARCHAR(100) DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `about_me` TEXT DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `can_post_rooms` TINYINT(1) DEFAULT 1;
ALTER TABLE `users` ADD COLUMN `can_post_listings` TINYINT(1) DEFAULT 1;
ALTER TABLE `users` ADD COLUMN `posting_suspended_reason` TEXT DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `posting_suspended_at` TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `posting_suspended_by` INT(11) NULL DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Step 2: Create rooms table
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `location` VARCHAR(255) NOT NULL,
  `rent` DECIMAL(10,2) NOT NULL,
  `gender_preference` ENUM('male','female','any') DEFAULT 'any',
  `role` VARCHAR(50) DEFAULT NULL,
  `conditions` TEXT DEFAULT NULL,
  `images` TEXT DEFAULT NULL,
  `amenities` TEXT DEFAULT NULL,
  `status` ENUM('pending','approved','rejected','suspended') DEFAULT 'pending',
  `status_reason` TEXT DEFAULT NULL,
  `views` INT(11) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 3: Create listings table
CREATE TABLE IF NOT EXISTS `listings` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `type` ENUM('land','house','car','other') NOT NULL DEFAULT 'other',
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(12,2) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `contact_phone` VARCHAR(20),
  `contact_email` VARCHAR(255),
  `specifications` TEXT,
  `images` TEXT DEFAULT NULL,
  `status` ENUM('pending','approved','rejected','suspended') DEFAULT 'pending',
  `status_reason` TEXT DEFAULT NULL,
  `views` INT(11) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 4: Create tickets table
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
  `priority` ENUM('low','medium','high') DEFAULT 'medium',
  `assigned_to` INT(11) UNSIGNED NULL DEFAULT NULL,
  `parent_id` INT(11) UNSIGNED NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 5: Create ticket_responses table
CREATE TABLE IF NOT EXISTS `ticket_responses` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_id` INT(11) UNSIGNED NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `message` TEXT NOT NULL,
  `is_admin` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 6: Create system_logs table
CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) UNSIGNED NULL DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT,
  `ip_address` VARCHAR(45),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 7: Create smtp_settings table
CREATE TABLE IF NOT EXISTS `smtp_settings` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `smtp_host` VARCHAR(255) NOT NULL,
  `smtp_port` INT(11) NOT NULL DEFAULT 587,
  `smtp_username` VARCHAR(255) NOT NULL,
  `smtp_password` VARCHAR(255) NOT NULL,
  `from_email` VARCHAR(255) NOT NULL,
  `from_name` VARCHAR(255) DEFAULT 'Roomio',
  `encryption` VARCHAR(10) DEFAULT 'tls',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` INT(11) UNSIGNED NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 8: Create ads table
CREATE TABLE IF NOT EXISTS `ads` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `image_url` VARCHAR(500),
  `link_url` VARCHAR(500),
  `position` ENUM('banner','sidebar','popup') DEFAULT 'banner',
  `status` ENUM('active','inactive') DEFAULT 'active',
  `start_date` DATE,
  `end_date` DATE,
  `clicks` INT(11) DEFAULT 0,
  `impressions` INT(11) DEFAULT 0,
  `created_by` INT(11) UNSIGNED NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DONE! Database setup complete
-- Ignore any "Duplicate column" errors - those mean the column already exists
