-- ========================================
-- SAFE DATABASE SETUP - ROOMIO
-- This version only adds missing columns
-- Run ONLY the parts that give errors in the simple version
-- ========================================

-- ONLY RUN THE SECTIONS YOU NEED!

-- ========================================
-- SECTION 1: ROOMS TABLE (Always safe to run)
-- ========================================
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

-- ========================================
-- SECTION 2: LISTINGS TABLE (Always safe to run)
-- ========================================
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

-- ========================================
-- SECTION 3: TICKETS TABLE (Always safe to run)
-- ========================================
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

-- ========================================
-- SECTION 4: TICKET_RESPONSES TABLE (Always safe to run)
-- ========================================
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

-- ========================================
-- SECTION 5: SYSTEM_LOGS TABLE (Always safe to run)
-- ========================================
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

-- ========================================
-- SECTION 6: SMTP_SETTINGS TABLE (Always safe to run)
-- ========================================
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

-- ========================================
-- SECTION 7: ADS TABLE (Always safe to run)
-- ========================================
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

-- ========================================
-- SECTION 8: USERS TABLE - ONLY MISSING COLUMNS
-- Run these ONE BY ONE if you get "Duplicate column" errors
-- ========================================

-- Posting access columns (critical!)
-- ALTER TABLE `users` ADD COLUMN `can_post_rooms` TINYINT(1) DEFAULT 1;
-- ALTER TABLE `users` ADD COLUMN `can_post_listings` TINYINT(1) DEFAULT 1;
-- ALTER TABLE `users` ADD COLUMN `posting_suspended_reason` TEXT DEFAULT NULL;
-- ALTER TABLE `users` ADD COLUMN `posting_suspended_at` TIMESTAMP NULL DEFAULT NULL;
-- ALTER TABLE `users` ADD COLUMN `posting_suspended_by` INT(11) NULL DEFAULT NULL;

-- Other user columns (uncomment only the ones you need)
-- ALTER TABLE `users` ADD COLUMN `gender` ENUM('male','female') DEFAULT NULL;
-- ALTER TABLE `users` ADD COLUMN `religion` VARCHAR(100) DEFAULT NULL;
-- ALTER TABLE `users` ADD COLUMN `lifestyle` VARCHAR(100) DEFAULT NULL;
-- ALTER TABLE `users` ADD COLUMN `university` VARCHAR(255) DEFAULT NULL;
-- ALTER TABLE `users` ADD COLUMN `budget_range` VARCHAR(100) DEFAULT NULL;
-- ALTER TABLE `users` ADD COLUMN `about_me` TEXT DEFAULT NULL;

-- ========================================
-- DONE!
-- ========================================
-- Now run this to check what you need:

SELECT 'Checking tables...' as status;

SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'rooms')
        THEN '✓ rooms table exists'
        ELSE '✗ rooms table MISSING - run Section 1'
    END as rooms_status,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'listings')
        THEN '✓ listings table exists'
        ELSE '✗ listings table MISSING - run Section 2'
    END as listings_status,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tickets')
        THEN '✓ tickets table exists'
        ELSE '✗ tickets table MISSING - run Section 3'
    END as tickets_status,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'smtp_settings')
        THEN '✓ smtp_settings table exists'
        ELSE '✗ smtp_settings table MISSING - run Section 6'
    END as smtp_status;

SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'can_post_rooms')
        THEN '✓ can_post_rooms exists'
        ELSE '✗ can_post_rooms MISSING - uncomment line 109'
    END as posting_rooms,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'can_post_listings')
        THEN '✓ can_post_listings exists'
        ELSE '✗ can_post_listings MISSING - uncomment line 110'
    END as posting_listings;
