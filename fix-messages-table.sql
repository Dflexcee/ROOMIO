-- Fix messages table to support file attachments
-- Run this in phpMyAdmin → roomio database → SQL tab

-- Add file attachment columns to messages table
ALTER TABLE `messages`
ADD COLUMN IF NOT EXISTS `file_name` VARCHAR(255) DEFAULT NULL AFTER `content`,
ADD COLUMN IF NOT EXISTS `file_type` VARCHAR(100) DEFAULT NULL AFTER `file_name`,
ADD COLUMN IF NOT EXISTS `file_url` VARCHAR(500) DEFAULT NULL AFTER `file_type`;

-- Success message
SELECT 'Messages table updated successfully! File attachment support added.' as message;
DESCRIBE messages;