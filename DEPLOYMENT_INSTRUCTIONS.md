# 🚀 DEPLOYMENT TO collins.alonaccess.com - COMPLETE GUIDE

## ✅ VERIFIED: NO HARDCODED URLs IN CODE!

All localhost URLs you see are **FALLBACK VALUES ONLY**. They get overridden by:
- `.env` file (which you'll create on server)
- Config.php defaults (which you'll update on server)

---

## 📋 DATABASE CREDENTIALS

```
Database Name: grampaxg_roomio
Database User: grampaxg_roomiouser
Database Pass: tM8=WqhO5vF*JFgo
Domain: https://collins.alonaccess.com
```

---

## 🎯 DEPLOYMENT STEPS

### STEP 1: BUILD PRODUCTION FILES (On Local Computer)

```bash
cd C:\xampp\htdocs\roomio
npm run build
```

**✅ Result:** `dist/` folder created

---

### STEP 2: EXPORT DATABASE (On Local Computer)

1. Open http://localhost/phpmyadmin
2. Click `roomio` database
3. Export → Quick → SQL → Go
4. Save as `roomio.sql`

---

### STEP 3: UPLOAD FILES TO SERVER

**Upload Structure:**

```
public_html/
├── index.html          ← From dist/
├── assets/             ← From dist/
├── vite.svg           ← From dist/ (if exists)
└── api/                ← Renamed from php-api/
    ├── public/
    ├── lib/
    ├── vendor/
    └── PHPMailer/
```

**Upload Instructions:**

1. **Frontend:** Upload ALL from `dist/` → `public_html/`
2. **Backend:** Upload ALL from `php-api/` → `public_html/api/`

---

### STEP 4: CREATE UPLOAD FOLDERS

In `public_html/`, create:

```
uploads/
├── avatars/
├── rooms/
├── listings/
├── id-cards/
└── chat-files/
```

**Set permissions to 755 for all folders**

---

### STEP 5: IMPORT DATABASE

1. Open phpMyAdmin in hosting
2. Select `grampaxg_roomio` database
3. Import → Choose `roomio.sql` → Go
4. Wait for success

---

### STEP 6: CREATE `.env` FILE ON SERVER

**Location:** `public_html/api/.env`

**Content:**

```env
# Database Configuration
DB_HOST=localhost
DB_NAME=grampaxg_roomio
DB_USER=grampaxg_roomiouser
DB_PASS=tM8=WqhO5vF*JFgo

# Application URLs
APP_URL=https://collins.alonaccess.com/api/public
UPLOAD_BASE_URL=https://collins.alonaccess.com/uploads

# CORS Configuration
CORS_ORIGINS=https://collins.alonaccess.com,http://collins.alonaccess.com

# Frontend URL
FRONTEND_URL=https://collins.alonaccess.com

# Email Configuration (Update with your SMTP)
SMTP_HOST=mail.alonaccess.com
SMTP_PORT=587
SMTP_USER=noreply@collins.alonaccess.com
SMTP_PASS=your_email_password
SMTP_FROM=noreply@collins.alonaccess.com
SMTP_FROM_NAME=Roomio

# Application Settings
ADMIN_EMAIL=admin@collins.alonaccess.com
SUPPORT_EMAIL=support@collins.alonaccess.com
SUPPORT_PHONE=+234 123 456 7890

# Security Settings
SESSION_SECURE=true
SESSION_HTTPONLY=true
SESSION_SAMESITE=Strict

# Environment
APP_ENV=production
```

---

### STEP 7: CREATE `.htaccess` FILE ON SERVER

**Location:** `public_html/.htaccess`

**Content:**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Don't rewrite API requests
  RewriteCond %{REQUEST_URI} !^/api/
  
  # Rewrite everything else to index.html
  RewriteRule ^ index.html [L]
</IfModule>

# Prevent directory listing
Options -Indexes

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

### STEP 8: UPDATE Config.php ON SERVER (IMPORTANT!)

**Location:** `public_html/api/lib/Config.php`

**Find lines 30-44 (around line 30):**

```php
self::$config = array_merge([
    'DB_HOST' => 'localhost',
    'DB_NAME' => 'roomio',
    'DB_USER' => 'root',
    'DB_PASS' => '',
    'APP_URL' => 'http://localhost/roomio/php-api/public',
    'UPLOAD_BASE_URL' => 'http://localhost/roomio/php-api/uploads',
    'CORS_ORIGINS' => 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5176',
```

**REPLACE WITH:**

```php
self::$config = array_merge([
    'DB_HOST' => 'localhost',
    'DB_NAME' => 'grampaxg_roomio',
    'DB_USER' => 'grampaxg_roomiouser',
    'DB_PASS' => 'tM8=WqhO5vF*JFgo',
    'APP_URL' => 'https://collins.alonaccess.com/api/public',
    'UPLOAD_BASE_URL' => 'https://collins.alonaccess.com/uploads',
    'CORS_ORIGINS' => 'https://collins.alonaccess.com',
```

**⚠️ ONLY change these 6 lines (32-37), leave everything else!**

---

## 🧪 TESTING

### Test 1: Frontend
Visit: `https://collins.alonaccess.com`
Expected: Roomio login page loads

### Test 2: API
Visit: `https://collins.alonaccess.com/api/public/auth/me.php`
Expected: `{"user":null}`

### Test 3: Login
Try logging in with existing account
Expected: Successful login

---

## ❌ TROUBLESHOOTING

### Error: "Database connection failed"
- Check `.env` file has correct credentials
- Verify database exists in phpMyAdmin

### Error: "404 on routes"
- Check `.htaccess` file exists
- Contact hosting to enable mod_rewrite

### Error: "CORS error"
- Update CORS_ORIGINS in `.env` to include both http and https

### Error: "Upload failed"
- Check uploads/ folder permissions (should be 755)

---

## 📝 DEPLOYMENT CHECKLIST

Copy this checklist:

- [ ] Built production files (`npm run build`)
- [ ] Exported database (`roomio.sql`)
- [ ] Uploaded `dist/` → `public_html/`
- [ ] Uploaded `php-api/` → `public_html/api/`
- [ ] Created `uploads/` folders with subfolders
- [ ] Set folder permissions to 755
- [ ] Imported database in phpMyAdmin
- [ ] Created `public_html/api/.env` with production config
- [ ] Created `public_html/.htaccess`
- [ ] Updated `public_html/api/lib/Config.php` lines 32-37
- [ ] Tested frontend loads
- [ ] Tested API responds
- [ ] Tested login works

---

## 🎯 SUMMARY: ONLY 3 FILES TO EDIT/CREATE ON SERVER

1. **CREATE:** `public_html/api/.env` (new file with database config)
2. **CREATE:** `public_html/.htaccess` (new file for URL rewriting)
3. **EDIT:** `public_html/api/lib/Config.php` (change 6 lines: 32-37)

**That's it! No changes to local code needed!**

---

## 📞 SUPPORT

If you encounter any issues:
1. Check error logs in hosting cPanel
2. Verify all files uploaded correctly
3. Double-check database credentials
4. Test API endpoints directly in browser

