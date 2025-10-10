# 🚀 Roomio Migration Checklist

## Pre-Migration Preparation

### 1. Backup Everything
- [ ] Backup database: `mysqldump -u root -p roomio > roomio_backup_$(date +%Y%m%d).sql`
- [ ] Backup uploads folder: `tar -czf uploads_backup.tar.gz php-api/uploads/`
- [ ] Backup .env files (if they exist)

### 2. Test Locally
- [ ] Run all features locally to ensure everything works
- [ ] Test user registration and login
- [ ] Test room/listing posting
- [ ] Test chat functionality
- [ ] Test ad system and analytics
- [ ] Test admin dashboard
- [ ] Verify verification workflow

---

## Configuration Changes (ONLY 2 Files to Update!)

### File 1: Backend Configuration (`php-api/.env`)

**Local (Development):**
```env
DB_HOST=localhost
DB_NAME=roomio
DB_USER=root
DB_PASS=

APP_URL=http://localhost/roomio/php-api/public
UPLOAD_BASE_URL=http://localhost/roomio/php-api/uploads
FRONTEND_URL=http://localhost:5173

CORS_ORIGINS=http://localhost:5173
```

**Production (Cloud/Hosting):**
```env
DB_HOST=your-database-host.com
DB_NAME=roomio_production
DB_USER=your_db_username
DB_PASS=your_secure_password

APP_URL=https://api.yourdomain.com/public
UPLOAD_BASE_URL=https://api.yourdomain.com/uploads
FRONTEND_URL=https://yourdomain.com

CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

APP_ENV=production
APP_DEBUG=false
SESSION_SECURE=true
```

### File 2: Frontend Configuration (`.env`)

**Local (Development):**
```env
VITE_API_BASE=http://localhost/roomio/php-api/public
VITE_APP_NAME=Roomio
VITE_FRONTEND_URL=http://localhost:5173
```

**Production (Cloud/Hosting):**
```env
VITE_API_BASE=https://api.yourdomain.com/public
VITE_APP_NAME=Roomio
VITE_FRONTEND_URL=https://yourdomain.com
```

---

## Migration Steps

### Step 1: Prepare Production Environment
- [ ] Purchase domain name (e.g., roomio.com)
- [ ] Get hosting (VPS, shared hosting, or cloud)
- [ ] Install required software:
  - [ ] PHP 8.0+
  - [ ] MySQL 5.7+
  - [ ] Apache/Nginx
  - [ ] Node.js 16+ (for building frontend)

### Step 2: Database Migration
- [ ] Create production database
- [ ] Import schema: `mysql -u username -p database_name < roomio_backup.sql`
- [ ] Verify tables created: `SHOW TABLES;`
- [ ] Apply optimizations: Run `database-optimization.sql` in phpMyAdmin

### Step 3: Backend Deployment
- [ ] Upload `php-api/` folder to server
- [ ] Create `php-api/.env` file with production values
- [ ] Set file permissions:
  ```bash
  chmod -R 755 php-api/uploads
  chmod -R 755 php-api/public
  chmod 600 php-api/.env
  ```
- [ ] Test API endpoint: `https://api.yourdomain.com/public/auth/me.php`

### Step 4: Frontend Build & Deployment
- [ ] Create `.env` file with production values
- [ ] Build for production: `npm run build`
- [ ] Upload `dist/` folder contents to web root
- [ ] Configure web server (see configs below)
- [ ] Test frontend: Open `https://yourdomain.com`

### Step 5: Web Server Configuration

#### Apache (.htaccess in frontend root)
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

#### Nginx (add to server block)
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Step 6: SSL Certificate (HTTPS)
- [ ] Install SSL certificate (Let's Encrypt recommended)
- [ ] Update `SESSION_SECURE=true` in `php-api/.env`
- [ ] Force HTTPS in web server config
- [ ] Test HTTPS: `https://yourdomain.com`

### Step 7: Post-Migration Testing
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Upload profile picture
- [ ] Post a room listing
- [ ] Post a regular listing
- [ ] Send a message
- [ ] Submit verification request
- [ ] Test ad display and tracking
- [ ] Access admin dashboard
- [ ] Test currency switching
- [ ] Test all forms and submissions

### Step 8: Performance Verification
- [ ] Check page load time (should be < 3s)
- [ ] Verify database indexes: `SHOW INDEX FROM users;`
- [ ] Test API response times
- [ ] Check image loading (lazy load working?)
- [ ] Monitor server resources

---

## Common Issues & Solutions

### Issue: "CORS Error" in browser console
**Solution:** Add your domain to `CORS_ORIGINS` in `php-api/.env`
```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Issue: "404 Not Found" on routes
**Solution:** Configure web server for SPA routing (see Step 5)

### Issue: Images not loading
**Solution:** Check `UPLOAD_BASE_URL` in `php-api/.env` matches your domain

### Issue: API requests failing
**Solution:** Verify `VITE_API_BASE` in `.env` matches your API URL

### Issue: Database connection error
**Solution:** Check database credentials in `php-api/.env`

### Issue: Session/login not working
**Solution:** 
- Set `SESSION_SECURE=true` if using HTTPS
- Check `session.cookie_secure` in `php.ini`
- Verify `CORS_ORIGINS` includes your frontend domain

---

## Environment Comparison Table

| Setting | Local Development | Production |
|---------|------------------|------------|
| DB_HOST | localhost | your-db-host.com |
| DB_NAME | roomio | roomio_production |
| APP_URL | http://localhost/roomio/... | https://api.yourdomain.com/... |
| FRONTEND_URL | http://localhost:5173 | https://yourdomain.com |
| APP_ENV | development | production |
| APP_DEBUG | true | false |
| SESSION_SECURE | false | true |
| VITE_API_BASE | http://localhost/roomio/... | https://api.yourdomain.com/... |

---

## Rollback Plan

If something goes wrong:

1. **Restore Database:**
   ```bash
   mysql -u username -p database_name < roomio_backup_YYYYMMDD.sql
   ```

2. **Restore Files:**
   ```bash
   tar -xzf uploads_backup.tar.gz
   ```

3. **Revert .env Files:**
   - Keep backups of working .env files
   - Copy back if needed

---

## Post-Migration Cleanup

After successful migration:

- [ ] Remove backup files from production server (security)
- [ ] Set up automated backups
- [ ] Configure monitoring/logging
- [ ] Set up error tracking
- [ ] Enable caching if needed
- [ ] Update DNS if needed
- [ ] Test from different devices/browsers

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check PHP error logs
3. Verify .env configuration
4. Test API endpoints directly
5. Check file permissions

---

## Summary

**Files to Update:** Only 2 files!
1. `php-api/.env` - Backend configuration
2. `.env` - Frontend configuration

**What Gets Updated:**
- Database connection details
- Domain URLs (API and Frontend)
- CORS origins
- Session security settings

**What Stays The Same:**
- All PHP code
- All React code
- Database structure
- Features and functionality

---

Built with ❤️ for easy deployment
