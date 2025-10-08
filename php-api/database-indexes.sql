-- Database Performance Indexes for Scalability
-- Run this file to add critical indexes for production performance
-- Execute: mysql -u root -p roomio < database-indexes.sql

USE roomio;

-- ========================================
-- FOREIGN KEY INDEXES (Critical for JOIN performance)
-- ========================================

-- Listings table
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);

-- Rooms table
CREATE INDEX IF NOT EXISTS idx_rooms_user_id ON rooms(user_id);

-- Messages table
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);

-- Conversations table (if exists)
-- CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
-- CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);

-- Tickets table (if exists)
-- CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
-- CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);

-- Reviews table (if exists)
-- CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
-- CREATE INDEX IF NOT EXISTS idx_reviews_room_id ON reviews(room_id);
-- CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);

-- ========================================
-- STATUS COLUMNS (Critical for filtering)
-- ========================================

-- Users table
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Rooms table
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- Listings table
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);

-- Users table - verification columns
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);

-- ========================================
-- TIMESTAMP INDEXES (Critical for sorting and filtering)
-- ========================================

-- Users table
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Rooms table - Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_rooms_status_created ON rooms(status, created_at DESC);

-- Listings table - Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON listings(status, created_at DESC);

-- Messages table - For retrieving recent messages
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ========================================
-- SEARCH OPTIMIZATION INDEXES
-- ========================================

-- Rooms table - Location-based searches
CREATE INDEX IF NOT EXISTS idx_rooms_location ON rooms(location);

-- Listings table - Location-based searches
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);

-- Users table - Email lookups for authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ========================================
-- COMPOSITE INDEXES (For complex queries)
-- ========================================

-- Active rooms by user (for user dashboard)
CREATE INDEX IF NOT EXISTS idx_rooms_user_status ON rooms(user_id, status);

-- Active listings by user (for user dashboard)
CREATE INDEX IF NOT EXISTS idx_listings_user_status ON listings(user_id, status);

-- Unread messages (if is_read column exists)
-- CREATE INDEX IF NOT EXISTS idx_messages_receiver_read ON messages(receiver_id, is_read);

-- Posting permissions (composite indexes for dashboard queries)
CREATE INDEX IF NOT EXISTS idx_users_can_post_rooms ON users(can_post_rooms);
CREATE INDEX IF NOT EXISTS idx_users_can_post_listings ON users(can_post_listings);

-- ========================================
-- FULLTEXT INDEXES (For search functionality)
-- Note: FULLTEXT indexes require specific column types (TEXT, VARCHAR)
-- Uncomment if your columns support FULLTEXT
-- ========================================

-- Enable FULLTEXT search on rooms
-- ALTER TABLE rooms ADD FULLTEXT INDEX idx_rooms_search (title, description, amenities);

-- Enable FULLTEXT search on listings
-- ALTER TABLE listings ADD FULLTEXT INDEX idx_listings_search (title, description);

-- ========================================
-- ANALYZE TABLES (Update statistics for query optimizer)
-- ========================================

ANALYZE TABLE users;
ANALYZE TABLE profiles;
ANALYZE TABLE rooms;
ANALYZE TABLE listings;
ANALYZE TABLE messages;

-- Display index information
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'roomio'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Success message
SELECT 'Database indexes created successfully! Your application is now optimized for production scalability.' AS Status;
