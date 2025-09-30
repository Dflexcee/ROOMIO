-- =====================================================
-- Tickets System Database Schema
-- Run this in phpMyAdmin → roomio database → SQL tab
-- =====================================================

-- 1. Create tickets table (main support tickets)
CREATE TABLE IF NOT EXISTS `tickets` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
    `status` ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for performance
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_priority` (`priority`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create ticket_responses table (messages within tickets)
CREATE TABLE IF NOT EXISTS `ticket_responses` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `ticket_id` INT UNSIGNED NOT NULL,
    `user_id` INT UNSIGNED,
    `message` TEXT NOT NULL,
    `is_admin` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for performance
    KEY `idx_ticket_id` (`ticket_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Show success message and table info
SELECT 'Tickets tables created successfully!' as message;
SELECT COUNT(*) as total_tickets FROM tickets;
SELECT COUNT(*) as total_responses FROM ticket_responses;
DESCRIBE tickets;
DESCRIBE ticket_responses;