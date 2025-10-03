-- Comprehensive Database Fixes for Roomio (MySQL 5.7+ Compatible)

-- 1. Ensure rooms table has all necessary columns
ALTER TABLE `rooms`
ADD COLUMN `gender_preference` ENUM('male','female','any') DEFAULT 'any' AFTER `rent`;

ALTER TABLE `rooms`
ADD COLUMN `role` VARCHAR(50) DEFAULT NULL AFTER `gender_preference`;

ALTER TABLE `rooms`
ADD COLUMN `conditions` TEXT DEFAULT NULL AFTER `role`;

ALTER TABLE `rooms`
ADD COLUMN `status` ENUM('pending','approved','rejected','suspended') DEFAULT 'pending' AFTER `conditions`;

ALTER TABLE `rooms`
ADD COLUMN `status_reason` TEXT DEFAULT NULL AFTER `status`;

ALTER TABLE `rooms`
ADD COLUMN `amenities` TEXT DEFAULT NULL AFTER `images`;

-- 2. Ensure users table has posting access columns
ALTER TABLE `users`
ADD COLUMN `can_post_rooms` TINYINT(1) DEFAULT 1 AFTER `status`;

ALTER TABLE `users`
ADD COLUMN `can_post_listings` TINYINT(1) DEFAULT 1 AFTER `can_post_rooms`;

ALTER TABLE `users`
ADD COLUMN `posting_suspended_reason` TEXT DEFAULT NULL AFTER `can_post_listings`;

ALTER TABLE `users`
ADD COLUMN `posting_suspended_at` TIMESTAMP NULL DEFAULT NULL AFTER `posting_suspended_reason`;

ALTER TABLE `users`
ADD COLUMN `posting_suspended_by` INT(11) NULL DEFAULT NULL AFTER `posting_suspended_at`;

-- 3. Ensure listings table exists and has all necessary columns
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
  KEY `user_id` (`user_id`),
  KEY `status` (`status`),
  KEY `type` (`type`),
  CONSTRAINT `listings_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Ensure tickets table has all necessary columns for threading
ALTER TABLE `tickets`
ADD COLUMN `priority` ENUM('low','medium','high') DEFAULT 'medium' AFTER `status`;

ALTER TABLE `tickets`
ADD COLUMN `assigned_to` INT(11) UNSIGNED NULL DEFAULT NULL AFTER `priority`;

ALTER TABLE `tickets`
ADD COLUMN `parent_id` INT(11) UNSIGNED NULL DEFAULT NULL AFTER `assigned_to`;

-- 5. Ensure ticket_responses table exists for threading
CREATE TABLE IF NOT EXISTS `ticket_responses` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_id` INT(11) UNSIGNED NOT NULL,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `message` TEXT NOT NULL,
  `is_admin` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ticket_responses_ticket_fk` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_responses_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Ensure system_logs table exists
CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) UNSIGNED NULL DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT,
  `ip_address` VARCHAR(45),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `action` (`action`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `system_logs_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Ensure smtp_settings table exists
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
  PRIMARY KEY (`id`),
  CONSTRAINT `smtp_settings_user_fk` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Ensure ads table exists
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
  PRIMARY KEY (`id`),
  KEY `status` (`status`),
  KEY `position` (`position`),
  CONSTRAINT `ads_user_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
