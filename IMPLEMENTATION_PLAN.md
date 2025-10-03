# Complete Implementation Plan for Roomio

## IMMEDIATE FIXES TO RUN NOW

### Step 1: Fix Database Issues
Run these SQL files in phpMyAdmin (roomio database → SQL tab):

1. **FIX_MESSAGES_TABLE.sql** - Fixes chat file_name error
2. **FIX_SCAM_ALERTS_TABLE.sql** - Fixes scam board foreign key error

### Step 2: Files Already Fixed
✅ Chat functionality (messages/list.php now handles missing columns)
✅ Scam alerts creation (scam-alerts/create.php)
✅ 8 syntax errors in various PHP files
✅ Verification system separation (middleware + endpoints)

---

## MAJOR FEATURES TO IMPLEMENT

### 1. POST LISTING PAGE (Multi-Property Types)
**Location**: `/post-listing`
**Features**:
- Dropdown: Choose property type (Lands, Houses, Cars, Other Properties)
- Dynamic forms based on selection
- Verification check (reuse from post-room)
- File uploads for images

**Files to Create**:
- `src/pages/PostListing.jsx`
- `php-api/public/listings/create.php`
- `php-api/public/listings/list.php`
- `php-api/public/listings/update.php`
- `php-api/public/listings/delete.php`

**Database Table**:
```sql
CREATE TABLE listings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type ENUM('land', 'house', 'car', 'other') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2),
  location VARCHAR(255),
  images JSON,
  specifications JSON COMMENT 'Flexible field for type-specific data',
  status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
  status_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_user_id (user_id),
  KEY idx_type (type),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 2. VIEW LISTING PAGE (User - See All Approved Listings)
**Location**: `/view-listings`
**Features**:
- Show only approved listings
- Dynamic search/filter by type, location, price
- Cards with images
- Click to view details

**Files to Create**:
- `src/pages/ViewListings.jsx`

---

### 3. MY LISTINGS PAGE (User - Manage Own Listings)
**Location**: `/my-listings`
**Features**:
- Show user's own listings with status badges
- Edit button → opens edit modal/page
- View engagement stats

**Files to Create**:
- `src/pages/MyListings.jsx`

---

### 4. ADMIN LISTINGS MANAGEMENT
**Location**: `/admin/listings-management`
**Features**:
- View all listings from all users
- Filter by type, status
- Actions: Approve, Reject, Suspend, Delete
- Add reason field for actions

**Files to Create**:
- `src/pages/admin/ListingsManagement.jsx`
- `php-api/public/admin/listings-actions.php`

---

### 5. ROOM LISTING (Rename + Add Verification)
**Current**: `/admin/listings`
**Rename to**: `/admin/room-listings`
**Add Features**:
- Approve/Reject/Suspend actions
- Verification workflow (similar to listings)
- Status reason field

---

### 6. FIND ROOM FIX
**Issue**: Not showing poster pictures
**Solution**: Already fixed in `php-api/public/rooms/list.php` (added LEFT JOIN users)
**Additional**: Add dynamic search that actually filters on backend

**Update needed**:
- Modify `rooms/list.php` to accept query params (search, location, minPrice, maxPrice)
- Update `FindRoom.jsx` to pass filters to API

---

### 7. HELP CENTER → ADMIN TICKETS + EMAIL INTEGRATION
**Current State**: Basic ticket creation
**Required**:
- When user creates ticket → Send email to admin
- When admin replies → Send email to user
- Email thread-like experience

**Files to Update**:
- `php-api/public/tickets/create.php` - Add email sending
- `php-api/public/tickets/reply.php` - Add email sending
- Use SMTP settings from database

**Integration**:
```php
// In tickets/create.php
$smtpSettings = getSmtpSettings($pdo); // From smtp-settings table
sendEmail($smtpSettings, $adminEmail, $subject, $message);
```

---

### 8. SMTP/SMS/EMAIL TEMPLATE CONNECTION
**Files**:
- `src/pages/admin/SMTPSettings.jsx` - Already exists
- `src/pages/admin/SMSSettings.jsx` - Already exists
- `src/pages/admin/EmailTemplates.jsx` - Already exists

**Required**:
- Ensure these save to database properly
- Create helper functions to load/use these settings
- Apply templates to ticket emails, verification emails, etc.

---

## NAVIGATION UPDATES

### User Dashboard Navbar
Add these links:
- Post Listing (new)
- View Listings (new)
- My Listings (new)

### Admin Dashboard Navbar
Update:
- "Listings" → "Room Listings"
Add:
- "All Listings Management" (new)

---

## CLEANUP TASKS

### Files to Delete:
```
All test-*.html files
All test-*.php files
All *-working.php, *-simple.php, *-fixed.php duplicates
All .md documentation files (except README if exists)
All backup files (*-backup.jsx, *-old.php)
verification-system-*.sql
add-sample-*.php
check-*.php
fix-*.sql (after running them)
```

**Keep Only**:
- Active endpoint files
- Current React components
- One working version of each feature

---

## API ENDPOINT SUMMARY

### Listings Endpoints (NEW)
- POST /listings/create.php
- GET /listings/list.php
- GET /listings/mine.php
- PUT /listings/update.php
- DELETE /listings/delete.php
- GET /listings/get.php?id={id}

### Admin Listings Endpoints (NEW)
- GET /admin/listings-all.php
- PUT /admin/listings-actions.php (approve/reject/suspend/delete)

### Rooms Endpoints (UPDATE)
- GET /rooms/list.php - Add query param support

### Tickets Endpoints (UPDATE)
- POST /tickets/create.php - Add email sending
- POST /tickets/reply.php - Add email sending

---

## IMPLEMENTATION ORDER

1. ✅ Fix immediate errors (chat, scam board)
2. Create listings database table
3. Create listings PHP endpoints
4. Create PostListing.jsx page
5. Create ViewListings.jsx page
6. Create MyListings.jsx page
7. Create admin ListingsManagement.jsx
8. Update rooms endpoints for filtering
9. Add email integration to tickets
10. Update navigation bars
11. Clean up unused files
12. Final testing

---

## TESTING CHECKLIST

- [ ] Chat works without file_name error
- [ ] Scam board creates alerts
- [ ] Find Room shows poster pictures
- [ ] Help Center creates tickets
- [ ] Tickets send emails to admin/user
- [ ] Post Listing works for all types
- [ ] View Listings shows approved only
- [ ] My Listings shows user's posts
- [ ] Admin can approve/reject listings
- [ ] Admin can approve/reject rooms
- [ ] SMTP settings work
- [ ] Email templates apply correctly
- [ ] All unused files deleted
- [ ] No console errors
- [ ] All navigation links work

---

**Priority**: Start with database fixes, then work on listings feature (most requested), then cleanup.