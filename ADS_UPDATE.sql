-- Add display duration and interval columns to ads table
-- Run this SQL to add new features for ad display control

ALTER TABLE ads
  ADD COLUMN display_duration INT DEFAULT 5 COMMENT 'How many seconds the ad displays before auto-close',
  ADD COLUMN skip_after_seconds INT DEFAULT 3 COMMENT 'Seconds before skip button appears',
  ADD COLUMN display_interval_hours INT DEFAULT 24 COMMENT 'Hours to wait before showing ad again to same user';

-- Verify the changes
SELECT 'Columns added successfully!' as status;
DESCRIBE ads;
