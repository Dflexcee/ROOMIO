-- Create Admin User
-- Run this in phpMyAdmin to create an admin user

-- First, let's see what users exist
SELECT id, email, role FROM users;

-- Create admin user (replace with your email and password)
INSERT INTO users (email, password_hash, role) VALUES 
('admin@roomio.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- The password hash above is for password: "password"
-- You can change the email and password as needed

-- Verify the admin user was created
SELECT id, email, role FROM users WHERE role = 'admin';
