# 🚀 ROOMIO - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Prerequisites
- ✅ PHP 8.0+
- ✅ MySQL 8.0+
- ✅ Node.js 16+
- ✅ XAMPP/WAMP (for local development)

### 2. Installation

```bash
# Clone & Install
git clone https://github.com/YOUR_USERNAME/roomio.git
cd roomio
npm install
```

### 3. Configure Environment

**Create `.env` in root**:
```env
VITE_API_BASE=http://localhost/roomio/php-api/public
VITE_FRONTEND_URL=http://localhost:5173
```

**Create `php-api/.env`**:
```env
DB_HOST=localhost
DB_NAME=roomio
DB_USER=root
DB_PASS=

APP_URL=http://localhost/roomio/php-api/public
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173

APP_ENV=development
```

### 4. Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE roomio"

# Import schema
mysql -u root -p roomio < php-api/database-optimization.sql
```

### 5. Start Development

```bash
npm run dev
# Open http://localhost:5173
```

---

## 📦 Production Deployment

### Update 2 Files:

**1. `php-api/.env`**:
```env
DB_HOST=your-production-host
DB_NAME=roomio_production
DB_USER=your_user
DB_PASS=your_password
APP_URL=https://api.yourdomain.com/public
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com
APP_ENV=production
SESSION_SECURE=true
```

**2. `.env`**:
```env
VITE_API_BASE=https://api.yourdomain.com/public
VITE_FRONTEND_URL=https://yourdomain.com
```

### Build & Deploy:
```bash
npm run build
# Upload dist/* to your web server
# Upload php-api/* to your API directory
```

---

## 🔑 Default Admin Account

Create manually in database:

```sql
INSERT INTO users (email, password_hash, role, full_name, email_confirmed)
VALUES (
  'admin@roomio.com',
  '$2y$10$YourHashedPasswordHere',
  'admin',
  'Admin User',
  1
);
```

Generate password hash in PHP:
```php
<?php
echo password_hash('your_password', PASSWORD_BCRYPT);
?>
```

---

## 📁 Important Files

- `README.md` - Full documentation
- `MIGRATION-CHECKLIST.md` - Deployment steps
- `OPTIMIZATION-SUMMARY.md` - Performance details
- `LICENSE` - MIT License

---

## 🆘 Troubleshooting

**Issue**: Can't connect to database
**Fix**: Check `php-api/.env` database credentials

**Issue**: CORS errors
**Fix**: Add your frontend URL to `CORS_ORIGINS` in `php-api/.env`

**Issue**: 404 on API calls
**Fix**: Ensure `APP_URL` in `php-api/.env` matches your setup

---

## 📧 Support

**Author**: Collins Ezih
**Email**: ezihcollins100@gmail.com

---

**Read `README.md` for complete documentation!**
