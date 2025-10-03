# Quick Start Testing Guide

## 🚀 Run This First!

Open your browser and go to:
```
http://localhost/roomio/test-api-endpoints.php
```

This will show you:
- ✓ Which endpoints are working
- ✓ Which files exist
- ✓ Which database tables are set up
- ✓ Which columns are present

---

## Step-by-Step Testing

### TEST 1: Login as Admin

**URL:** http://localhost:5173/admin/login

**Credentials:**
```
Email: admin@example.com
Password: [your admin password]
```

**Expected:** Should login successfully and redirect to admin dashboard

---

### TEST 2: Check Posting Access Management

**URL:** http://localhost:5173/admin/posting-access

**What to check:**
1. Page loads without errors ✓
2. Shows 3 users ✓
3. See columns: Name, Email, Can Post Rooms, Can Post Listings ✓

**Current State in Database:**
- admin@example.com - Can post rooms: YES, Can post listings: YES
- testuser@example.com - Can post rooms: YES, Can post listings: YES
- dflexcee@gmail.com - Can post rooms: NO (SUSPENDED), Can post listings: NO

**Test Action:**
1. Click on "testuser@example.com"
2. Toggle "Can Post Rooms" to OFF
3. Add reason: "Testing restriction"
4. Save

**Expected:** User should now be suspended from posting rooms

---

### TEST 3: Try to Post Room as Suspended User

**Step 1:** Logout from admin
**Step 2:** Login as the suspended user (dflexcee@gmail.com or testuser if you suspended them)
**Step 3:** Go to http://localhost:5173/post-room

**Expected Result:**
- Should show message: "You do not have permission to post rooms"
- Form should be disabled or show error
- Cannot submit

---

### TEST 4: Post Room as Allowed User

**Step 1:** Login as a user who CAN post (testuser@example.com if not suspended)

**Step 2:** Go to http://localhost:5173/post-room

**Step 3:** Fill the form:
```
Title: Spacious 2BR Near University
Location: Yaba, Lagos
Rent: 45000
Gender Preference: Any
Role: Looking for roommate
Description: Clean 2-bedroom apartment, 5 minutes from campus

Conditions: No smoking, quiet hours after 10pm

Amenities (select):
- WiFi
- Security
- Water supply
- Parking
```

**Step 4:** Upload 1-2 images (JPG or PNG, under 5MB each)

**Step 5:** Click Submit

**Expected:**
- Form submits successfully
- Shows success message
- Room created with status = 'pending'

**Verify in Database:**
```sql
SELECT id, title, status, user_id FROM rooms ORDER BY id DESC LIMIT 1;
```
Should show your room with status='pending'

---

### TEST 5: Admin Approves Room

**Step 1:** Login as admin

**Step 2:** Go to http://localhost:5173/admin/room-listings

**Expected:**
- See the room you just posted
- Status badge shows "pending" (yellow color)
- See owner name, email
- See rent amount

**Step 3:** Click "✓ Approve" button

**Step 4:** Modal opens - add reason: "Good listing, approved"

**Step 5:** Click Confirm

**Expected:**
- Status changes to "approved" (green color)
- Room now visible in public Find Room page

---

### TEST 6: View Approved Room on Find Room Page

**Step 1:** Logout (or open incognito window)

**Step 2:** Go to http://localhost:5173/find-room

**Expected:**
- Shows the approved room
- Images display correctly
- Can see location, rent, gender preference
- Click on room → Modal with full details

**If page is empty:** Room is still pending - admin must approve first

---

### TEST 7: Test Find Roommate Page

**Step 1:** Go to http://localhost:5173/find-roommate

**Expected:**
- Shows 2 users (admin and regular users, not including yourself)
- User cards show avatars (or default avatar)
- Can filter by gender, university, religion

**Step 2:** Click on a user card

**Expected:**
- Modal opens
- Shows user profile: name, university, gender, religion, lifestyle, budget range, about me

**If page is empty:**
- Database has no other users yet
- You can register more test users to populate this page

---

### TEST 8: Test Help Center

**Step 1:** Login as regular user

**Step 2:** Go to http://localhost:5173/help-center

**Step 3:** Create a ticket:
```
Subject: Cannot upload room images
Priority: Medium
Message: When I try to upload images to my room post, I get an error. Please help.
```

**Step 4:** Submit

**Expected:**
- Ticket created successfully
- Shows in ticket list
- If SMTP configured: You receive confirmation email

---

### TEST 9: Admin Responds to Ticket

**Step 1:** Login as admin

**Step 2:** Go to http://localhost:5173/admin/tickets

**Expected:**
- See the ticket you just created
- Shows subject, user, status, priority

**Step 3:** Click on the ticket

**Step 4:** Add reply:
```
Thank you for reporting. Please ensure:
1. Images are in JPG or PNG format
2. File size is under 5MB
3. You have posting permission

Let me know if the issue persists.
```

**Step 5:** Submit reply

**Expected:**
- Reply saved
- If SMTP configured: User receives email notification

---

### TEST 10: Test SMTP Settings

**Step 1:** Login as admin

**Step 2:** Go to http://localhost:5173/admin/smtp-settings

**Step 3:** Fill in SMTP details:
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
Username: your-email@gmail.com
Password: [your app password]
From Email: noreply@roomio.com
From Name: Roomio Support
Encryption: TLS
```

**Step 4:** Click Test Email (if button exists) or just Save

**Expected:**
- Settings saved successfully
- Shows success message

**Verify in Database:**
```sql
SELECT smtp_host, smtp_port, from_email FROM smtp_settings LIMIT 1;
```

---

### TEST 11: Test Admin Ads

**Step 1:** Login as admin

**Step 2:** Go to http://localhost:5173/admin/ads

**Expected:**
- Page loads without errors
- Shows ads list (may be empty)
- Has "Create New Ad" button

**Step 3:** Click "Create New Ad"

**Step 4:** Fill form:
```
Title: Welcome to Roomio!
Description: Find your perfect roommate today
Ad Type: Popup
Target Link: https://roomio.com
Display Frequency: Once per session
Active: Yes
```

**Step 5:** Upload an image

**Step 6:** Save

**Expected:**
- Ad created successfully
- Shows in ads list
- Can edit/delete ad

---

### TEST 12: Test Listings (Property Sales)

**Step 1:** Login as regular user

**Step 2:** Go to http://localhost:5173/post-listing

**Step 3:** Fill form:
```
Type: House
Title: 3-Bedroom Bungalow for Sale
Price: 25000000
Location: Lekki, Lagos
Description: Beautiful 3BR house in a secure estate
Contact Phone: +234 123 456 7890
Contact Email: seller@example.com
```

**Step 4:** Upload 1-5 images

**Step 5:** Submit

**Expected:**
- Listing created with status='pending'
- Can view in "My Listings"

---

### TEST 13: View My Listings

**URL:** http://localhost:5173/my-listings

**Expected:**
- Shows the listing you just posted
- Images display in carousel (can navigate through 5 images)
- Can click Edit or Delete

---

### TEST 14: Admin Manages Listings

**Step 1:** Login as admin

**Step 2:** Go to http://localhost:5173/admin/all-listings

**Expected:**
- See all listings from all users
- Can approve/reject/suspend
- Images display correctly

**Step 3:** Approve the listing

**Expected:**
- Status changes to 'approved'
- Now visible on public View Listings page

---

### TEST 15: Public View Listings

**URL:** http://localhost:5173/view-listings

**Expected:**
- Shows only approved listings
- Images display in carousel
- Can filter by type (Land/House/Car), location, price
- Click on listing → See full details

---

## 🐛 Troubleshooting

### "Room not showing in Find Room"
**Fix:**
1. Check room status in database - must be 'approved'
2. Admin must approve from `/admin/room-listings`

### "Validation error on post-room"
**Fix:**
1. Ensure all required fields are filled:
   - Title ✓
   - Location ✓
   - Rent (must be > 0) ✓
   - Gender Preference ✓
   - Role ✓
2. Check if you have posting permission
3. Check if you're verified

### "Cannot post - permission denied"
**Fix:**
1. Check `/admin/posting-access` - ensure "Can Post Rooms" is ON
2. If suspended, admin must restore permission

### "Email not sending"
**Fix:**
1. Configure SMTP at `/admin/smtp-settings`
2. If using Gmail, use App Password (not regular password)
3. Check PHP error logs: `c:\xampp\php\logs\php_error_log`
4. System will fallback to PHP mail() if SMTP fails

### "Images not uploading"
**Fix:**
1. Check file size - must be under 5MB
2. Check file type - JPG, PNG, GIF, WebP only
3. Ensure upload directories exist:
   - `c:\xampp\htdocs\roomio\php-api\uploads\room-images\`
   - `c:\xampp\htdocs\roomio\php-api\uploads\listing-images\`
4. Check directory permissions (should be writable)

### "Page showing 401 Unauthorized"
**Fix:**
1. Login first
2. Check session - may have expired
3. Clear browser cookies and login again

### "Find Roommate shows no users"
**Fix:**
1. Database needs more users
2. Register 2-3 test accounts
3. Fill profile information (gender, university, etc.)

---

## ✅ Quick Verification Commands

Run these in phpMyAdmin or MySQL console:

```sql
-- Check rooms
SELECT id, title, status, user_id FROM rooms;

-- Check user permissions
SELECT id, email, can_post_rooms, can_post_listings, posting_suspended_reason
FROM users;

-- Check tickets
SELECT t.id, t.subject, t.status, u.email as user_email
FROM tickets t
LEFT JOIN users u ON t.user_id = u.id;

-- Check listings
SELECT id, title, type, status, price FROM listings;

-- Check SMTP settings
SELECT smtp_host, smtp_port, from_email FROM smtp_settings;

-- Check system logs
SELECT * FROM system_logs ORDER BY id DESC LIMIT 10;
```

---

## 🎯 Success Checklist

After testing, you should have:
- [ ] Posted at least 1 room (status: pending)
- [ ] Admin approved the room (status: approved)
- [ ] Room shows in Find Room page
- [ ] At least 1 user suspended from posting
- [ ] Suspended user cannot post (gets error)
- [ ] At least 1 ticket created
- [ ] Admin replied to ticket
- [ ] SMTP settings configured
- [ ] At least 1 listing posted
- [ ] Listing shows in My Listings with images
- [ ] Admin approved listing
- [ ] Listing shows in View Listings page

---

**Run the test script first:** http://localhost/roomio/test-api-endpoints.php

This will tell you exactly what's working and what needs fixing!
