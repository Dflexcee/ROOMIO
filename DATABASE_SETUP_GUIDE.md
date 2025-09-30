# 🗄️ Database Setup Guide

This guide will help you set up the database connection for the Roomio admin panel.

## 📋 **REQUIREMENTS**

- **XAMPP** (or similar local server)
- **MySQL** database server
- **PHP** with PDO extension

## 🔧 **STEP 1: Check Current Status**

1. **Open the database config checker:**
   ```
   http://localhost/roomio/php-api/public/check-database-config.php
   ```

2. **Check what's missing:**
   - Config file exists?
   - Database variables defined?
   - Database connection working?

## 🔧 **STEP 2: Create Database Configuration**

1. **Create or update `php-api/config.php`:**
   ```php
   <?php
   // Database configuration
   $host = 'localhost';
   $dbname = 'roomio';
   $username = 'root';
   $password = '';
   
   $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
   $options = [
       PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
       PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
       PDO::ATTR_EMULATE_PREPARES => false,
   ];
   ?>
   ```

2. **Update the database credentials:**
   - `$host`: Your MySQL host (usually 'localhost')
   - `$dbname`: Your database name (create 'roomio' database)
   - `$username`: Your MySQL username (usually 'root')
   - `$password`: Your MySQL password (usually empty for XAMPP)

## 🔧 **STEP 3: Create Database**

1. **Open phpMyAdmin:**
   ```
   http://localhost/phpmyadmin
   ```

2. **Create database:**
   - Click "New" in the left sidebar
   - Database name: `roomio`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

3. **Create tables (run this SQL):**
   ```sql
   -- Users table
   CREATE TABLE IF NOT EXISTS `users` (
     `id` int(11) NOT NULL AUTO_INCREMENT,
     `user_id` int(11) NOT NULL,
     `email` varchar(255) NOT NULL,
     `password` varchar(255) NOT NULL,
     `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
     `last_login` timestamp NULL,
     `email_confirmed` tinyint(1) DEFAULT 0,
     PRIMARY KEY (`id`),
     UNIQUE KEY `user_id` (`user_id`),
     UNIQUE KEY `email` (`email`)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

   -- Profiles table
   CREATE TABLE IF NOT EXISTS `profiles` (
     `id` int(11) NOT NULL AUTO_INCREMENT,
     `user_id` int(11) NOT NULL,
     `full_name` varchar(255) DEFAULT NULL,
     `phone` varchar(20) DEFAULT NULL,
     `role` varchar(50) DEFAULT 'user',
     `is_verified` tinyint(1) DEFAULT 0,
     `status` varchar(20) DEFAULT 'active',
     `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
     PRIMARY KEY (`id`),
     UNIQUE KEY `user_id` (`user_id`)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

   -- Rooms table
   CREATE TABLE IF NOT EXISTS `rooms` (
     `id` int(11) NOT NULL AUTO_INCREMENT,
     `user_id` int(11) NOT NULL,
     `title` varchar(255) NOT NULL,
     `description` text,
     `price` decimal(10,2) NOT NULL,
     `location` varchar(255) NOT NULL,
     `bedrooms` int(11) DEFAULT NULL,
     `bathrooms` int(11) DEFAULT NULL,
     `area` int(11) DEFAULT NULL,
     `status` varchar(20) DEFAULT 'active',
     `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
     `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     PRIMARY KEY (`id`)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

   -- Insert sample data
   INSERT INTO `users` (`user_id`, `email`, `password`, `email_confirmed`) VALUES
   (1, 'admin@example.com', 'password123', 1),
   (2, 'user@example.com', 'password123', 1),
   (3, 'agent@example.com', 'password123', 1);

   INSERT INTO `profiles` (`user_id`, `full_name`, `phone`, `role`, `is_verified`, `status`) VALUES
   (1, 'Admin User', '+1234567890', 'admin', 1, 'active'),
   (2, 'John Doe', '+1234567891', 'user', 1, 'active'),
   (3, 'Jane Smith', '+1234567892', 'agent', 1, 'active');

   INSERT INTO `rooms` (`user_id`, `title`, `description`, `price`, `location`, `bedrooms`, `bathrooms`, `area`, `status`) VALUES
   (2, 'Beautiful 2BR Apartment', 'Spacious apartment in downtown area', 150000.00, 'Lagos, Nigeria', 2, 2, 1200, 'active'),
   (3, 'Modern 3BR House', 'Newly built house with modern amenities', 200000.00, 'Abuja, Nigeria', 3, 3, 1500, 'active');
   ```

## 🔧 **STEP 4: Test Database Connection**

1. **Test the config checker again:**
   ```
   http://localhost/roomio/php-api/public/check-database-config.php
   ```

2. **Should show:**
   - ✅ Config file exists
   - ✅ Config file readable
   - ✅ Database variables defined
   - ✅ Database connection

## 🔧 **STEP 5: Test Real Database APIs**

1. **Test users API:**
   ```
   http://localhost/roomio/php-api/public/admin/users-real.php
   ```

2. **Test listings API:**
   ```
   http://localhost/roomio/php-api/public/admin/listings-real.php
   ```

3. **Test stats API:**
   ```
   http://localhost/roomio/php-api/public/admin/stats-real.php
   ```

## 🔧 **STEP 6: Switch to Real Database**

1. **Update `src/config/api.js`:**
   ```javascript
   admin: {
     users: '/admin/users-real.php',        // Changed from admin-simple-users.php
     listings: '/admin/listings-real.php',  // Changed from admin-simple-listings.php  
     stats: '/admin/stats-real.php'         // Changed from admin-simple-stats.php
   }
   ```

2. **Test admin pages:**
   - `http://localhost:5173/admin/dashboard`
   - `http://localhost:5173/admin/users`
   - `http://localhost:5173/admin/listings`

## 🚨 **TROUBLESHOOTING**

### Issue 1: "Config file not found"
**Solution:** Create `php-api/config.php` with database configuration

### Issue 2: "Database variables not defined"
**Solution:** Check that `$dsn`, `$username`, `$password` are defined in config.php

### Issue 3: "Database connection failed"
**Solutions:**
- Check XAMPP MySQL is running
- Verify database name exists
- Check username/password
- Ensure database server is accessible

### Issue 4: "Unexpected token '<'" 
**Solution:** This means PHP is returning HTML error pages instead of JSON. Check:
- PHP syntax errors in config.php
- Database connection issues
- File permissions

## 📞 **NEED HELP?**

If you're still having issues:

1. **Check XAMPP status:**
   - Apache: Running
   - MySQL: Running

2. **Check file permissions:**
   - `php-api/config.php` should be readable

3. **Check database:**
   - Database 'roomio' exists
   - Tables created successfully
   - Sample data inserted

4. **Use fallback system:**
   - If database fails, APIs will use mock data
   - Admin panel will still work with mock data

## 🎯 **SUCCESS INDICATORS**

When everything is working:
- ✅ Database config checker shows all green
- ✅ Real database APIs return JSON data
- ✅ Admin pages load with real data
- ✅ No "Unexpected token" errors

**Ready to proceed with real database setup?** 🚀
