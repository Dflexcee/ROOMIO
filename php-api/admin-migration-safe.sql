-- Safe Admin Migration Schema for PHP Backend
-- This file safely creates admin tables without conflicts

-- 1. Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. SMTP Settings Table
CREATE TABLE IF NOT EXISTS smtp_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    host VARCHAR(255) NOT NULL,
    port INT DEFAULT 587,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. SMS Settings Table
CREATE TABLE IF NOT EXISTS sms_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_key VARCHAR(255) NOT NULL,
    from_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Payment Gateway Settings Table
CREATE TABLE IF NOT EXISTS payment_gateway_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(100) NOT NULL,
    public_key VARCHAR(255) NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    webhook_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Broadcasts Table (check if it exists with different structure)
CREATE TABLE IF NOT EXISTS admin_broadcasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    channel ENUM('email', 'sms', 'push') DEFAULT 'email',
    audience ENUM('all', 'verified', 'tenant', 'landlord', 'agent') DEFAULT 'all',
    target_count INT DEFAULT 0,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tickets Table (use different name to avoid conflicts)
CREATE TABLE IF NOT EXISTS admin_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Ticket Responses Table
CREATE TABLE IF NOT EXISTS admin_ticket_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT,
    admin_id INT,
    message TEXT NOT NULL,
    is_admin_response BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. User Payments Table (for feature access)
CREATE TABLE IF NOT EXISTS user_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) DEFAULT 0.00,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Payment Settings Table (check if exists first)
-- First, let's check if the table exists and what columns it has
-- If it exists with different structure, we'll create a new one with different name
CREATE TABLE IF NOT EXISTS admin_payment_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feature_name VARCHAR(100) UNIQUE NOT NULL,
    feature_label VARCHAR(255) NOT NULL,
    description TEXT,
    unlock_price DECIMAL(10,2) DEFAULT 0.00,
    is_locked BOOLEAN DEFAULT TRUE,
    duration_type ENUM('days', 'weeks', 'months', 'years') DEFAULT 'days',
    duration_value INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 10. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role ENUM('admin', 'manager') DEFAULT 'manager',
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_admin_user (user_id)
);

-- 11. System Logs Table (check if exists)
CREATE TABLE IF NOT EXISTS admin_system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    actor VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Ads Table (check if exists)
CREATE TABLE IF NOT EXISTS admin_ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    target_link VARCHAR(500) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default data only if tables are empty
INSERT IGNORE INTO email_templates (`key`, name, subject, body) VALUES
('welcome', 'Welcome Email', 'Welcome to Roomio!', 'Welcome to Roomio! We are excited to have you join our community.'),
('ticket_auto_response', 'Ticket Auto Response', 'Your ticket has been received', 'Thank you for contacting us. We have received your ticket and will respond within 24 hours.'),
('room_interest', 'Room Interest Notification', 'Someone is interested in your room', 'A user has shown interest in your room listing. Contact them to discuss further.');

INSERT IGNORE INTO admin_payment_settings (feature_name, feature_label, description, unlock_price, is_locked, duration_type, duration_value) VALUES
('premium_listing', 'Premium Listing', 'Highlight your room listings', 5.00, TRUE, 'days', 30),
('unlimited_messages', 'Unlimited Messages', 'Send unlimited messages to other users', 10.00, TRUE, 'days', 30),
('advanced_search', 'Advanced Search', 'Access advanced search filters', 3.00, TRUE, 'days', 30);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_tickets_user_id ON admin_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_tickets_status ON admin_tickets(status);
CREATE INDEX IF NOT EXISTS idx_admin_ticket_responses_ticket_id ON admin_ticket_responses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_user_payments_user_id ON user_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payments_feature ON user_payments(feature_name);
CREATE INDEX IF NOT EXISTS idx_admin_system_logs_created_at ON admin_system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_broadcasts_sent_at ON admin_broadcasts(sent_at);
