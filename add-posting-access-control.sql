-- Add posting access control fields to users table
-- This allows admins to control user posting permissions independently

ALTER TABLE users
ADD COLUMN IF NOT EXISTS can_post_rooms TINYINT(1) DEFAULT 1 COMMENT 'Can post room listings',
ADD COLUMN IF NOT EXISTS can_post_listings TINYINT(1) DEFAULT 1 COMMENT 'Can post property listings',
ADD COLUMN IF NOT EXISTS posting_suspended_reason TEXT DEFAULT NULL COMMENT 'Reason for posting suspension',
ADD COLUMN IF NOT EXISTS posting_suspended_at TIMESTAMP NULL DEFAULT NULL COMMENT 'When posting was suspended',
ADD COLUMN IF NOT EXISTS posting_suspended_by INT(11) NULL DEFAULT NULL COMMENT 'Admin who suspended posting';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_posting_access ON users(can_post_rooms, can_post_listings);