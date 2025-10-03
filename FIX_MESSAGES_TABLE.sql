-- Fix messages table for file attachments
-- Run this in phpMyAdmin SQL tab

-- Check if columns exist, if not add them
SET @exist_file_name := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'roomio' AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'file_name');
SET @exist_file_type := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'roomio' AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'file_type');
SET @exist_file_url := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'roomio' AND TABLE_NAME = 'messages' AND COLUMN_NAME = 'file_url');

SET @sql_file_name := IF(@exist_file_name = 0,
    'ALTER TABLE messages ADD COLUMN file_name VARCHAR(255) DEFAULT NULL',
    'SELECT "file_name already exists" as message');
SET @sql_file_type := IF(@exist_file_type = 0,
    'ALTER TABLE messages ADD COLUMN file_type VARCHAR(100) DEFAULT NULL',
    'SELECT "file_type already exists" as message');
SET @sql_file_url := IF(@exist_file_url = 0,
    'ALTER TABLE messages ADD COLUMN file_url VARCHAR(500) DEFAULT NULL',
    'SELECT "file_url already exists" as message');

PREPARE stmt FROM @sql_file_name;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

PREPARE stmt FROM @sql_file_type;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

PREPARE stmt FROM @sql_file_url;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Messages table fixed!' as status;