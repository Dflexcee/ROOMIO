# Configuration Guide

This project now uses environment variables and configuration files to manage hardcoded values, making it easier to deploy to different environments.

## Configuration Files

### 1. PHP Backend Configuration

**File:** `php-api/config.env.example`
- Copy this file to `php-api/config.env` or `php-api/.env`
- Contains database, URL, CORS, email, and security settings

**File:** `php-api/lib/Config.php`
- Central configuration class that loads environment variables
- Provides helper methods for common configurations

### 2. Frontend Configuration

**File:** `config.env.example`
- Copy this file to `.env` in the project root
- Contains frontend environment variables

## Setup Instructions

### For Development (Local)

1. **Backend Configuration:**
   ```bash
   # Copy the example file
   cp php-api/config.env.example php-api/config.env
   
   # Edit the configuration
   # Update URLs, database settings, etc.
   ```

2. **Frontend Configuration:**
   ```bash
   # Copy the example file
   cp config.env.example .env
   
   # Edit the configuration
   # Update API base URL, support information, etc.
   ```

### For Production (Hosting)

1. **Backend Configuration:**
   - Create `php-api/config.env` with production values
   - Update `APP_URL` to your production domain
   - Update `UPLOAD_BASE_URL` to your production uploads URL
   - Update `CORS_ORIGINS` to your production frontend URL
   - Update database credentials
   - Update email settings

2. **Frontend Configuration:**
   - Create `.env` with production values
   - Update `VITE_API_BASE` to your production API URL
   - Update support information

## Key Configuration Variables

### Backend (PHP)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | `127.0.0.1` |
| `DB_NAME` | Database name | `roomio` |
| `DB_USER` | Database user | `ruser` |
| `DB_PASS` | Database password | `yourpassword` |
| `APP_URL` | Base API URL | `https://yourdomain.com/api` |
| `UPLOAD_BASE_URL` | Uploads base URL | `https://yourdomain.com/uploads` |
| `CORS_ORIGINS` | Allowed CORS origins | `https://yourdomain.com` |
| `ADMIN_EMAIL` | Admin email | `admin@yourdomain.com` |
| `SUPPORT_EMAIL` | Support email | `support@yourdomain.com` |
| `SUPPORT_PHONE` | Support phone | `+1 234 567 8900` |

### Frontend (React)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE` | API base URL | `https://yourdomain.com/api` |
| `VITE_APP_NAME` | App name | `Roomio` |
| `VITE_SUPPORT_EMAIL` | Support email | `support@yourdomain.com` |
| `VITE_SUPPORT_PHONE` | Support phone | `+1 234 567 8900` |

## Benefits

1. **Easy Deployment:** Change URLs and settings without editing code
2. **Environment Separation:** Different configs for dev/staging/production
3. **Security:** Sensitive data in environment variables, not in code
4. **Maintainability:** Centralized configuration management

## Migration from Hardcoded Values

The following hardcoded values have been moved to configuration:

- ✅ Upload URLs in PHP upload handlers
- ✅ CORS origins in bootstrap.php
- ✅ Database credentials in config.php
- ✅ Email settings in send-broadcast.php
- ✅ Support information in HelpCenter.jsx
- ✅ Session security settings

## Troubleshooting

1. **Configuration not loading:** Ensure the config file exists and has correct permissions
2. **CORS errors:** Check that `CORS_ORIGINS` includes your frontend URL
3. **Upload errors:** Verify `UPLOAD_BASE_URL` is accessible
4. **Database errors:** Check database credentials in config

## Security Notes

- Never commit `.env` or `config.env` files to version control
- Use strong passwords for production
- Enable HTTPS in production (`SESSION_SECURE=true`)
- Restrict CORS origins to your actual domains

