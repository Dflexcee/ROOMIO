-- COMPLETE FIX FOR ALL VERIFICATION ISSUES
-- Run this SQL file to add missing columns and set correct defaults

-- 1. Add missing verified_for_rooms and verified_for_listings columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS verified_for_rooms TINYINT(1) DEFAULT 0 AFTER can_post_rooms,
ADD COLUMN IF NOT EXISTS verified_for_listings TINYINT(1) DEFAULT 0 AFTER can_post_listings;

-- 2. Set default to block posting for NEW users (change existing default to 0)
ALTER TABLE users
MODIFY COLUMN can_post_rooms TINYINT(1) DEFAULT 0,
MODIFY COLUMN can_post_listings TINYINT(1) DEFAULT 0;

-- 3. Update existing admin users to bypass verification
UPDATE users
SET can_post_rooms = 1,
    can_post_listings = 1,
    verified_for_rooms = 1,
    verified_for_listings = 1,
    verification_status = 'verified'
WHERE role IN ('admin', 'manager');

-- 4. Ensure verification_requests table has all needed columns
CREATE TABLE IF NOT EXISTS verification_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_type ENUM('student', 'tenant', 'landlord', 'agent', 'individual') DEFAULT 'individual',
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    profile_picture VARCHAR(500),
    government_id_type VARCHAR(50),
    government_id_number VARCHAR(100),
    government_id_image VARCHAR(500),
    nin VARCHAR(20),
    school_id_type VARCHAR(50),
    school_id_number VARCHAR(100),
    school_id_image VARCHAR(500),
    school_name VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_message TEXT,
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Show summary
SELECT 'Database updated successfully!' AS Status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as unverified_users FROM users WHERE verification_status != 'verified';
SELECT COUNT(*) as verification_requests FROM verification_requests WHERE status = 'pending';
