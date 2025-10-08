# Roomio Deployment Guide

This guide will help you deploy Roomio to any server or hosting environment.

## 🚀 Quick Configuration Checklist

When moving to a new server, you only need to update **2 files**:

### 1. Frontend Configuration: `.env`
### 2. Backend Configuration: `php-api/.env`

---

## 📝 Step-by-Step Deployment

### Step 1: Clone/Upload Project

```bash
# On your server
git clone <your-repo-url> roomio
cd roomio
```

Or upload via FTP/SFTP to your server.

---

### Step 2: Configure Frontend Environment

Copy the example file and update values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# API Configuration - UPDATE THIS
VITE_API_BASE=https://your-domain.com/api

# Application Info
VITE_APP_NAME=Roomio
VITE_APP_VERSION=1.0.0
```

**Important:** Change `VITE_API_BASE` to your actual API URL.

---

### Step 3: Configure Backend Environment

Create backend environment file:

```bash
cd php-api
cp .env.example .env
```

Edit `php-api/.env`:

```env
# Database Configuration - UPDATE THESE
DB_HOST=localhost
DB_NAME=roomio
DB_USER=your_db_user
DB_PASS=your_db_password

# Application URLs - UPDATE THESE
APP_URL=https://your-domain.com/api
UPLOAD_BASE_URL=https://your-domain.com/api/uploads
FRONTEND_URL=https://your-domain.com

# CORS Origins - UPDATE THIS (comma-separated)
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Contact Information - UPDATE THESE
ADMIN_EMAIL=admin@your-domain.com
SUPPORT_EMAIL=support@your-domain.com
SUPPORT_PHONE=+1234567890

# Session Configuration (Recommended for production)
SESSION_SECURE=true
SESSION_HTTPONLY=true
SESSION_SAMESITE=Strict
```

---

### Step 4: Setup Database

1. Create MySQL database:

```sql
CREATE DATABASE roomio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import schema:

```bash
mysql -u your_user -p roomio < RUN_ALL_FIXES_AND_SETUP.sql
```

Or use phpMyAdmin:
- Open phpMyAdmin
- Select `roomio` database
- Go to "SQL" tab
- Copy contents of `RUN_ALL_FIXES_AND_SETUP.sql`
- Click "Go"

3. Create admin user:

```sql
INSERT INTO users (email, password, role, status, verification_status, created_at)
VALUES (
  'admin@your-domain.com',
  '$2y$10$YourBcryptHashHere',  -- Use password_hash() to generate
  'admin',
  'active',
  'verified',
  NOW()
);
```

To generate password hash, create temporary file `hash.php`:

```php
<?php
echo password_hash('your-secure-password', PASSWORD_BCRYPT);
```

Run: `php hash.php` and copy the hash.

---

### Step 5: Install Frontend Dependencies

```bash
npm install
```

---

### Step 6: Build Frontend

```bash
npm run build
```

This creates a `dist/` folder with production-ready files.

---

### Step 7: Configure Web Server

#### Option A: Apache (.htaccess)

Frontend `.htaccess` (in project root):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Backend `.htaccess` (already in `php-api/public/`):

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

#### Option B: Nginx

```nginx
# Frontend
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/roomio/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.your-domain.com;
    root /var/www/roomio/php-api/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

---

### Step 8: Set Permissions

```bash
# Make uploads directory writable
chmod 755 php-api/uploads
chmod 755 php-api/uploads/avatars
chmod 755 php-api/uploads/rooms
chmod 755 php-api/uploads/listings
chmod 755 php-api/uploads/chat
chmod 755 php-api/uploads/ads
chmod 755 php-api/uploads/id-cards

# If using Apache, ensure .htaccess is readable
chmod 644 .htaccess
chmod 644 php-api/public/.htaccess
```

---

## 🌍 Environment-Specific Examples

### Local Development (XAMPP)

`.env`:
```env
VITE_API_BASE=http://localhost/roomio/php-api/public
```

`php-api/.env`:
```env
DB_HOST=localhost
DB_NAME=roomio
DB_USER=root
DB_PASS=
APP_URL=http://localhost/roomio/php-api/public
UPLOAD_BASE_URL=http://localhost/roomio/php-api/uploads
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173
SESSION_SECURE=false
```

### Shared Hosting (cPanel)

`.env`:
```env
VITE_API_BASE=https://your-domain.com/api
```

`php-api/.env`:
```env
DB_HOST=localhost
DB_NAME=username_roomio
DB_USER=username_roomio
DB_PASS=your_password
APP_URL=https://your-domain.com/api
UPLOAD_BASE_URL=https://your-domain.com/api/uploads
FRONTEND_URL=https://your-domain.com
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
SESSION_SECURE=true
SESSION_HTTPONLY=true
SESSION_SAMESITE=Strict
```

Directory structure on cPanel:
```
public_html/
├── api/          # Symlink to roomio/php-api/public
├── index.html    # From roomio/dist
└── assets/       # From roomio/dist/assets
```

### VPS/Dedicated Server

`.env`:
```env
VITE_API_BASE=https://api.your-domain.com
```

`php-api/.env`:
```env
DB_HOST=localhost
DB_NAME=roomio
DB_USER=roomio_user
DB_PASS=secure_password_here
APP_URL=https://api.your-domain.com
UPLOAD_BASE_URL=https://api.your-domain.com/uploads
FRONTEND_URL=https://your-domain.com
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
SESSION_SECURE=true
SESSION_HTTPONLY=true
SESSION_SAMESITE=Strict
```

---

## 🔒 Production Security Checklist

- [ ] Use HTTPS (SSL certificate installed)
- [ ] Set `SESSION_SECURE=true` in production
- [ ] Use strong database passwords
- [ ] Restrict database user permissions (only roomio database)
- [ ] Keep `.env` files outside public directory
- [ ] Set proper file permissions (755 for directories, 644 for files)
- [ ] Enable CORS only for your domain
- [ ] Regular database backups
- [ ] Keep PHP and dependencies updated

---

## 🧪 Testing After Deployment

1. **Test API:**
   ```bash
   curl https://your-domain.com/api/
   ```
   Should return: `{"message":"Roomio API is running"}`

2. **Test Frontend:**
   Open `https://your-domain.com` in browser

3. **Test Login:**
   Use admin credentials to login

4. **Test File Upload:**
   Try uploading avatar or room image

---

## 🐛 Common Issues

### Issue: CORS Error

**Solution:** Update `CORS_ORIGINS` in `php-api/.env` to include your frontend domain.

### Issue: 404 on API Routes

**Solution:** Check `.htaccess` in `php-api/public/` exists and mod_rewrite is enabled.

### Issue: File Upload Fails

**Solution:** Check uploads directory permissions:
```bash
chmod 755 php-api/uploads/*
```

### Issue: Database Connection Failed

**Solution:** Verify credentials in `php-api/.env` match your database.

---

## 📞 Support

For deployment issues:
1. Check server error logs (usually in `/var/log/apache2/error.log` or cPanel error logs)
2. Check PHP error logs
3. Enable debug mode temporarily to see detailed errors
4. Check browser console for frontend errors

---

## 🎉 You're Done!

Your Roomio application should now be running at your domain!

Remember: Only update `.env` files when changing servers - no code changes needed!
