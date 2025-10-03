-- Create ads table for popup ad system
CREATE TABLE IF NOT EXISTS ads (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    target_link VARCHAR(500),
    ad_type ENUM('popup', 'banner', 'sidebar') DEFAULT 'popup',
    display_frequency ENUM('once_per_session', 'once_per_day', 'always') DEFAULT 'once_per_session',
    target_audience ENUM('all', 'verified', 'unverified', 'tenant', 'landlord', 'agent') DEFAULT 'all',
    active TINYINT(1) DEFAULT 1,
    priority INT DEFAULT 0 COMMENT 'Higher priority ads show first',
    impressions INT DEFAULT 0 COMMENT 'Number of times shown',
    clicks INT DEFAULT 0 COMMENT 'Number of times clicked',
    created_by INT(10) UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_active (active),
    INDEX idx_type (ad_type),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create ad_views table to track user views (for frequency control)
CREATE TABLE IF NOT EXISTS ad_views (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ad_id INT(10) UNSIGNED NOT NULL,
    user_id INT(10) UNSIGNED,
    session_id VARCHAR(255),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ad_user (ad_id, user_id),
    INDEX idx_session (session_id),
    INDEX idx_viewed_at (viewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create ad_clicks table to track clicks
CREATE TABLE IF NOT EXISTS ad_clicks (
    id INT(10) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ad_id INT(10) UNSIGNED NOT NULL,
    user_id INT(10) UNSIGNED,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ad_id) REFERENCES ads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ad_id (ad_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;