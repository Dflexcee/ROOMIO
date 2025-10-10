-- ============================================================================
-- DATABASE OPTIMIZATION SCRIPT - ROOMIO
-- Purpose: Add indexes to improve query performance across all tables
--
-- IMPORTANT: This script only adds indexes, it does NOT modify table structures
-- Safe to run multiple times (uses IF NOT EXISTS where supported)
--
-- Run this in phpMyAdmin → roomio database → SQL tab
-- ============================================================================

-- ============================================================================
-- SECTION 1: USERS TABLE INDEXES
-- These indexes improve authentication, user searches, and admin filters
-- ============================================================================

-- Email index - Critical for login and user lookups
-- Improves: SELECT * FROM users WHERE email = ?
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Account type index - For filtering users by their role (tenant/landlord/agent)
-- Improves: SELECT * FROM users WHERE account_type = ?
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);

-- Verification status index - For admin panel to filter verified/pending users
-- Improves: SELECT * FROM users WHERE verification_status = ?
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);

-- Role index - For role-based access control and admin filtering
-- Improves: SELECT * FROM users WHERE role = ?
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Created at index - For sorting users by registration date
-- Improves: SELECT * FROM users ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Composite index for common admin queries (account type + verification status)
-- Improves: SELECT * FROM users WHERE account_type = ? AND verification_status = ?
CREATE INDEX IF NOT EXISTS idx_users_account_verification ON users(account_type, verification_status);

-- ============================================================================
-- SECTION 2: ROOMS TABLE INDEXES
-- These indexes improve room searches, filtering, and user room listings
-- ============================================================================

-- User ID index - For fetching all rooms posted by a specific user
-- Improves: SELECT * FROM rooms WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON rooms(user_id);

-- Created at index - For sorting rooms by posting date (newest first)
-- Improves: SELECT * FROM rooms ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at);

-- Rent index - For filtering rooms by price range
-- Improves: SELECT * FROM rooms WHERE rent BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_rooms_rent ON rooms(rent);

-- Location index - For location-based searches
-- Improves: SELECT * FROM rooms WHERE location LIKE ?
CREATE INDEX IF NOT EXISTS idx_rooms_location ON rooms(location);

-- Status index - For filtering approved/pending/rejected rooms
-- Improves: SELECT * FROM rooms WHERE status = 'approved'
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- Composite index for common search queries (status + location)
-- Improves: SELECT * FROM rooms WHERE status = 'approved' AND location LIKE ?
CREATE INDEX IF NOT EXISTS idx_rooms_status_location ON rooms(status, location);

-- Composite index for user's room management (user_id + status)
-- Improves: SELECT * FROM rooms WHERE user_id = ? AND status = ?
CREATE INDEX IF NOT EXISTS idx_rooms_user_status ON rooms(user_id, status);

-- Composite index for price-based searches with status filter
-- Improves: SELECT * FROM rooms WHERE status = 'approved' AND rent BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_rooms_status_rent ON rooms(status, rent);

-- ============================================================================
-- SECTION 3: LISTINGS TABLE INDEXES
-- These indexes improve listing searches and user listing management
-- ============================================================================

-- User ID index - For fetching all listings posted by a specific user
-- Improves: SELECT * FROM listings WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);

-- Created at index - For sorting listings by posting date
-- Improves: SELECT * FROM listings ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);

-- Type index - For filtering by listing type (land/house/car/other)
-- Improves: SELECT * FROM listings WHERE type = ?
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);

-- Status index - For filtering approved/pending/rejected listings
-- Improves: SELECT * FROM listings WHERE status = 'approved'
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

-- Composite index for common queries (status + type)
-- Improves: SELECT * FROM listings WHERE status = 'approved' AND type = ?
CREATE INDEX IF NOT EXISTS idx_listings_status_type ON listings(status, type);

-- ============================================================================
-- SECTION 4: MESSAGES TABLE INDEXES
-- These indexes improve chat performance and message history loading
-- ============================================================================

-- Sender ID index - For fetching all messages sent by a user
-- Improves: SELECT * FROM messages WHERE sender_id = ?
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Receiver ID index - For fetching all messages received by a user
-- Improves: SELECT * FROM messages WHERE receiver_id = ?
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);

-- Created at index - For sorting messages chronologically
-- Improves: SELECT * FROM messages ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Read at index - For filtering read/unread messages (if column exists)
-- Note: Only create if read_at column exists in your schema
-- Improves: SELECT * FROM messages WHERE read_at IS NULL

-- Composite index for conversation queries - CRITICAL for chat performance
-- Improves: SELECT * FROM messages WHERE sender_id = ? AND receiver_id = ?
-- Also improves: SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?)
--                OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);

-- Composite index for the reverse direction (optimizes both directions of conversation)
-- Improves: SELECT * FROM messages WHERE receiver_id = ? AND sender_id = ?
CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender ON messages(receiver_id, sender_id);

-- Composite index for unread messages per user
-- Improves: SELECT * FROM messages WHERE receiver_id = ? AND is_read = FALSE
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read ON messages(receiver_id, is_read);

-- Composite index for conversation with timestamp (for pagination)
-- Improves: SELECT * FROM messages WHERE sender_id = ? AND receiver_id = ? ORDER BY created_at
CREATE INDEX IF NOT EXISTS idx_messages_conversation_time ON messages(sender_id, receiver_id, created_at);

-- ============================================================================
-- SECTION 5: VERIFICATION_REQUESTS TABLE INDEXES
-- These indexes improve verification workflow and admin panel performance
-- ============================================================================

-- User ID index - For fetching verification requests by user
-- Improves: SELECT * FROM verification_requests WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);

-- Status index - For filtering pending/approved/rejected verification requests
-- Improves: SELECT * FROM verification_requests WHERE status = 'pending'
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);

-- Created at index - For sorting verification requests by submission date
-- Improves: SELECT * FROM verification_requests ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_verification_requests_created_at ON verification_requests(created_at);

-- Composite index for admin workflow (status + created_at for queue management)
-- Improves: SELECT * FROM verification_requests WHERE status = 'pending' ORDER BY created_at
CREATE INDEX IF NOT EXISTS idx_verification_requests_status_created ON verification_requests(status, created_at);

-- ============================================================================
-- SECTION 6: AD_CLICKS TABLE INDEXES
-- These indexes improve ad analytics and click tracking
-- ============================================================================

-- Ad ID index - For fetching all clicks for a specific ad
-- Improves: SELECT * FROM ad_clicks WHERE ad_id = ?
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON ad_clicks(ad_id);

-- User ID index - For tracking clicks by user (prevents duplicate clicks)
-- Improves: SELECT * FROM ad_clicks WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_ad_clicks_user_id ON ad_clicks(user_id);

-- Clicked at index - For time-based analytics and reports
-- Improves: SELECT * FROM ad_clicks WHERE clicked_at BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_ad_clicks_clicked_at ON ad_clicks(clicked_at);

-- Composite index for ad analytics (ad_id + clicked_at for time-series data)
-- Improves: SELECT COUNT(*) FROM ad_clicks WHERE ad_id = ? AND clicked_at >= ?
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_time ON ad_clicks(ad_id, clicked_at);

-- Composite index for duplicate prevention (ad_id + user_id)
-- Improves: SELECT * FROM ad_clicks WHERE ad_id = ? AND user_id = ?
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_user ON ad_clicks(ad_id, user_id);

-- ============================================================================
-- SECTION 7: AD_IMPRESSIONS TABLE INDEXES
-- These indexes improve ad impression tracking and analytics
-- ============================================================================

-- Ad ID index - For fetching all impressions for a specific ad
-- Improves: SELECT * FROM ad_impressions WHERE ad_id = ?
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_id ON ad_impressions(ad_id);

-- User ID index - For tracking impressions by user
-- Improves: SELECT * FROM ad_impressions WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_ad_impressions_user_id ON ad_impressions(user_id);

-- Viewed at index - For time-based analytics and reports
-- Improves: SELECT * FROM ad_impressions WHERE viewed_at BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_ad_impressions_viewed_at ON ad_impressions(viewed_at);

-- Composite index for ad analytics (ad_id + viewed_at for time-series data)
-- Improves: SELECT COUNT(*) FROM ad_impressions WHERE ad_id = ? AND viewed_at >= ?
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_time ON ad_impressions(ad_id, viewed_at);

-- Composite index for unique impression tracking (ad_id + user_id)
-- Improves: SELECT * FROM ad_impressions WHERE ad_id = ? AND user_id = ?
CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_user ON ad_impressions(ad_id, user_id);

-- ============================================================================
-- SECTION 8: COMMUNITY_POSTS TABLE INDEXES
-- These indexes improve community feed loading and user post management
-- ============================================================================

-- User ID index - For fetching all posts by a specific user
-- Improves: SELECT * FROM community_posts WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);

-- Created at index - Critical for loading community feed in chronological order
-- Improves: SELECT * FROM community_posts ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);

-- Composite index for user's post timeline
-- Improves: SELECT * FROM community_posts WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_community_posts_user_created ON community_posts(user_id, created_at);

-- ============================================================================
-- SECTION 9: SCAM_ALERTS TABLE INDEXES
-- These indexes improve scam alert listing and filtering
-- ============================================================================

-- Created at index - For displaying recent scam alerts first
-- Improves: SELECT * FROM scam_alerts ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_scam_alerts_created_at ON scam_alerts(created_at);

-- Status index - For filtering alerts by status (pending/verified/dismissed)
-- Improves: SELECT * FROM scam_alerts WHERE status = 'verified'
CREATE INDEX IF NOT EXISTS idx_scam_alerts_status ON scam_alerts(status);

-- User ID index - For tracking alerts related to specific users
-- Improves: SELECT * FROM scam_alerts WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_scam_alerts_user_id ON scam_alerts(user_id);

-- Composite index for admin workflow (status + created_at)
-- Improves: SELECT * FROM scam_alerts WHERE status = 'pending' ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_scam_alerts_status_created ON scam_alerts(status, created_at);

-- ============================================================================
-- SECTION 10: TICKETS TABLE INDEXES
-- These indexes improve support ticket management and user support history
-- ============================================================================

-- User ID index - For fetching all tickets submitted by a user
-- Improves: SELECT * FROM tickets WHERE user_id = ?
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);

-- Status index - For filtering tickets by status (open/in_progress/resolved/closed)
-- Improves: SELECT * FROM tickets WHERE status = 'open'
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- Created at index - For sorting tickets by submission date
-- Improves: SELECT * FROM tickets ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

-- Priority index - For filtering high-priority tickets
-- Improves: SELECT * FROM tickets WHERE priority = 'high'
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);

-- Composite index for support queue management (status + priority + created_at)
-- Improves: SELECT * FROM tickets WHERE status = 'open' AND priority = 'high' ORDER BY created_at
CREATE INDEX IF NOT EXISTS idx_tickets_status_priority_created ON tickets(status, priority, created_at);

-- Composite index for user's ticket history (user_id + created_at)
-- Improves: SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_tickets_user_created ON tickets(user_id, created_at);

-- Composite index for status-based filtering with timestamp
-- Improves: SELECT * FROM tickets WHERE status = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_tickets_status_created ON tickets(status, created_at);

-- ============================================================================
-- BONUS INDEXES: Additional performance optimizations
-- ============================================================================

-- Support tickets table (if using support_tickets instead of tickets)
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);

-- Post comments table - for loading comments on community posts
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at);

-- System logs table - for admin auditing and debugging
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON system_logs(action);

-- Ads table - for ad management
CREATE INDEX IF NOT EXISTS idx_ads_is_active ON ads(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at);

-- ============================================================================
-- VERIFICATION AND OPTIMIZATION TIPS
-- ============================================================================

-- After running this script, you can verify indexes were created with:
-- SHOW INDEX FROM users;
-- SHOW INDEX FROM rooms;
-- SHOW INDEX FROM messages;
-- etc.

-- To analyze query performance, use EXPLAIN before your SELECT queries:
-- EXPLAIN SELECT * FROM messages WHERE sender_id = 1 AND receiver_id = 2;

-- To see index usage statistics:
-- SELECT * FROM information_schema.statistics
-- WHERE table_schema = 'roomio'
-- ORDER BY table_name, index_name;

-- ============================================================================
-- MAINTENANCE RECOMMENDATIONS
-- ============================================================================

-- 1. Run ANALYZE TABLE periodically to update index statistics:
--    ANALYZE TABLE users, rooms, messages, listings;

-- 2. Monitor slow queries with slow query log enabled in MySQL config

-- 3. Use EXPLAIN to verify that your queries are actually using these indexes

-- 4. Consider adding more specific indexes based on your actual query patterns

-- 5. Remove unused indexes to reduce write overhead (check index usage first)

-- ============================================================================
-- SCRIPT COMPLETE
-- ============================================================================

SELECT 'Database optimization complete! All indexes have been added.' as status;
SELECT 'Run SHOW INDEX FROM table_name; to verify indexes for each table.' as next_step;
