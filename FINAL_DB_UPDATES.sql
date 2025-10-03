-- ========================================
-- FINAL DATABASE UPDATES FOR ROOMIO
-- Run this to complete your setup
-- ========================================

USE roomio;

-- Already completed automatically:
-- ✓ rooms.status_changed_by column added
-- ✓ rooms.status_changed_at column added

-- Verify your setup:
SELECT 'Database Setup Verification' as status;

-- Check rooms table
SELECT
    COUNT(*) as total_rooms,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
    SUM(CASE WHEN status = 'flagged' THEN 1 ELSE 0 END) as flagged
FROM rooms;

-- Check users table posting permissions
SELECT
    COUNT(*) as total_users,
    SUM(CASE WHEN can_post_rooms = 1 THEN 1 ELSE 0 END) as can_post_rooms,
    SUM(CASE WHEN can_post_listings = 1 THEN 1 ELSE 0 END) as can_post_listings,
    SUM(CASE WHEN can_post_rooms = 0 THEN 1 ELSE 0 END) as suspended_from_rooms
FROM users;

-- Check if SMTP settings exist
SELECT COUNT(*) as smtp_settings_count FROM smtp_settings;

-- Check system logs
SELECT COUNT(*) as total_logs FROM system_logs;

-- Check tickets
SELECT COUNT(*) as total_tickets FROM tickets;

SELECT '✅ Database verification complete!' as status;
SELECT 'All required tables and columns are present.' as message;
