-- Create the ruser MySQL user with the original password
CREATE USER IF NOT EXISTS 'ruser'@'localhost' IDENTIFIED BY 'cord3001';
CREATE USER IF NOT EXISTS 'ruser'@'127.0.0.1' IDENTIFIED BY 'cord3001';

-- Grant all privileges on the roomio database
GRANT ALL PRIVILEGES ON roomio.* TO 'ruser'@'localhost';
GRANT ALL PRIVILEGES ON roomio.* TO 'ruser'@'127.0.0.1';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Verify user was created
SELECT User, Host FROM mysql.user WHERE User = 'ruser';
