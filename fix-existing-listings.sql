-- Fix existing listings with invalid user_id
-- Run this in phpMyAdmin → roomio database → SQL tab

-- First, let's see what we have
SELECT 'Current listings with user_id issues:' as info;
SELECT r.id, r.title, r.user_id, u.email as user_exists 
FROM rooms r 
LEFT JOIN users u ON r.user_id = u.id 
WHERE r.user_id IS NULL OR u.id IS NULL;

-- Get the first available user ID
SELECT 'First available user:' as info;
SELECT id, email, full_name FROM users LIMIT 1;

-- Fix listings with NULL user_id by assigning them to the first user
UPDATE rooms 
SET user_id = (SELECT id FROM users LIMIT 1) 
WHERE user_id IS NULL;

-- Fix listings with invalid user_id by assigning them to the first user
UPDATE rooms 
SET user_id = (SELECT id FROM users LIMIT 1) 
WHERE user_id NOT IN (SELECT id FROM users);

-- Set default status for listings that don't have one
UPDATE rooms 
SET status = 'pending' 
WHERE status IS NULL OR status = '';

-- Verify the fix
SELECT 'After fix - all listings should have valid user_id:' as info;
SELECT r.id, r.title, r.user_id, r.status, u.email as owner_email, u.full_name as owner_name
FROM rooms r 
LEFT JOIN users u ON r.user_id = u.id 
ORDER BY r.id;

-- Show final count
SELECT 'Final count:' as info;
SELECT COUNT(*) as total_listings FROM rooms;
SELECT status, COUNT(*) as count FROM rooms GROUP BY status;
