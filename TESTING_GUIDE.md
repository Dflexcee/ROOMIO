# Testing Guide - Roomio Application

## ✅ Database Setup Complete!

Your database is fully configured with:
- ✅ 3 users (2 can post, 1 suspended)
- ✅ 1 SMTP configuration
- ✅ 14 system logs
- ✅ All required tables and columns

---

## 🧪 Test Each Feature

### 1. **Test Posting Access Control**

**Step 1:** Login as admin
```
URL: http://localhost:5173/admin/login
```

**Step 2:** Go to Posting Access Management
```
URL: http://localhost:5173/admin/posting-access
Expected: See all 3 users with their posting permissions
```

**Step 3:** Suspend a user's room posting access
```
Action: Click on a user, toggle "Can Post Rooms" to OFF
Reason: "Testing posting restriction"
Expected: User should be suspended from posting rooms
```

**Step 4:** Login as that suspended user
```
URL: http://localhost:5173/login
Try: Go to http://localhost:5173/post-room
Expected: Should see message "You do not have permission to post rooms"
```

---

### 2. **Test Room Posting (As Regular User)**

**Step 1:** Login as a user with posting permission
```
URL: http://localhost:5173/login
```

**Step 2:** Post a Room
```
URL: http://localhost:5173/post-room

Fill in:
- Title: "Spacious 2BR Apartment Near Campus"
- Location: "Lagos, Nigeria"
- Rent: 50000
- Gender Preference: Any
- Role: Looking for roommate
- Description: "Clean, safe, close to university"
- Upload: 1-5 images

Expected: Form submits successfully, room created with status='pending'
```

**Step 3:** Verify room was created
```
Check database:
SELECT * FROM rooms ORDER BY id DESC LIMIT 1;

Expected: Should see your room with status='pending'
```

---

### 3. **Test Admin Room Management**

**Step 1:** Login as admin
```
URL: http://localhost:5173/admin/login
```

**Step 2:** View all rooms
```
URL: http://localhost:5173/admin/room-listings

Expected:
- See the room you just posted
- Status badge shows "pending" (yellow)
- Owner information displayed
```

**Step 3:** Approve the room
```
Action: Click "✓ Approve" button
Reason: "Looks good, approved for listing"

Expected:
- Status changes to "approved" (green)
- Room now visible in Find Room page
```

**Step 4:** Test other actions
```
Try:
- Flag a room → Status becomes "flagged" (orange)
- Reject a room → Status becomes "rejected" (red)
- Re-approve a rejected room → Status becomes "approved" (green)
```

---

### 4. **Test Find Room Page (Public View)**

**Step 1:** Go to Find Room
```
URL: http://localhost:5173/find-room

Expected:
- Only shows rooms with status='approved'
- Room images display correctly
- Can see poster information
- Can filter by location, gender, rent
```

**Step 2:** Click on a room
```
Action: Click "View Details"

Expected:
- Modal opens with full room details
- Image carousel works (if multiple images)
- Can see contact information
```

---

### 5. **Test Find Roommate Page**

**Step 1:** Go to Find Roommate
```
URL: http://localhost:5173/find-roommate

Expected:
- Shows all users (non-admin, non-banned)
- User avatars display
- Can filter by gender, university, religion, lifestyle
```

**Step 2:** View a profile
```
Action: Click on a user card

Expected:
- Modal shows full profile
- About me, budget range, preferences visible
```

---

### 6. **Test Help Center + Email Notifications**

**Step 1:** Configure SMTP (if not done)
```
URL: http://localhost:5173/admin/smtp-settings

Fill in your SMTP details:
- Host: smtp.gmail.com (or your provider)
- Port: 587
- Username: your-email@gmail.com
- Password: your-app-password
- Encryption: TLS

Save settings
```

**Step 2:** Submit a ticket as user
```
URL: http://localhost:5173/help-center

Fill in:
- Subject: "Test ticket - Room posting issue"
- Priority: Medium
- Message: "I can't upload images to my room post"

Submit

Expected:
- Ticket created
- User receives confirmation email
```

**Step 3:** Admin views and replies
```
URL: http://localhost:5173/admin/tickets

Action: Click on the ticket, add reply
Reply: "Please ensure images are under 5MB and in JPG/PNG format"

Expected:
- Reply saved
- User receives email notification about admin reply
```

**Step 4:** User replies back
```
URL: http://localhost:5173/help-center (or tickets page)

Reply: "Thanks! It's working now"

Expected:
- Admin receives email notification about user reply
- Email threading maintained
```

---

### 7. **Test Admin Ads Manager**

**Step 1:** Go to Ads Manager
```
URL: http://localhost:5173/admin/ads

Expected: Page loads without errors
```

**Step 2:** Create a new ad
```
Action: Click "Create New Ad"

Fill in:
- Title: "Welcome to Roomio!"
- Description: "Find your perfect roommate"
- Ad Type: Popup
- Target Link: https://roomio.com
- Upload image

Expected: Ad created successfully
```

**Step 3:** View/Edit/Delete ad
```
Try all CRUD operations
Expected: All should work without errors
```

---

### 8. **Test Listings (Property/Car/Land Sales)**

**Step 1:** Post a listing
```
URL: http://localhost:5173/post-listing

Fill in:
- Type: Land / House / Car
- Title: "3-Bedroom House for Sale"
- Price: 15000000
- Location: "Lekki, Lagos"
- Upload: 1-5 images

Expected: Listing created with status='pending'
```

**Step 2:** View My Listings
```
URL: http://localhost:5173/my-listings

Expected:
- See your posted listing
- Images display in carousel (5 images max)
- Can edit or delete
```

**Step 3:** Admin manages listings
```
URL: http://localhost:5173/admin/all-listings

Expected:
- See all listings
- Can approve/reject/suspend
- Images display correctly
```

**Step 4:** Public view
```
URL: http://localhost:5173/view-listings

Expected:
- Only approved listings visible
- Images in carousel
- Can filter by type, location, price
```

---

## 🐛 Common Issues & Solutions

### Issue: "Can't post room - validation error"
**Solution:**
- Ensure all required fields filled: title, location, rent, gender, role
- Check if user has posting permission at `/admin/posting-access`

### Issue: "Room not showing in Find Room"
**Solution:**
- Check room status in database - must be 'approved'
- Admin must approve from `/admin/room-listings`

### Issue: "Email not sending"
**Solution:**
- Verify SMTP settings at `/admin/smtp-settings`
- Check PHP error logs at `c:\xampp\php\logs\php_error_log`
- System will fallback to PHP mail() if PHPMailer fails

### Issue: "Images not displaying"
**Solution:**
- Check upload directories exist and are writable:
  - `c:\xampp\htdocs\roomio\php-api\uploads\room-images\`
  - `c:\xampp\htdocs\roomio\php-api\uploads\listing-images\`
- Check image paths in database are correct

### Issue: "Posting access page not loading"
**Solution:**
- Verify you're logged in as admin
- Check browser console for errors
- Verify endpoint exists: `php-api\public\admin\posting-access.php`

---

## 📊 Database Queries for Debugging

### Check rooms:
```sql
SELECT id, title, status, user_id, created_at FROM rooms ORDER BY id DESC LIMIT 10;
```

### Check user posting permissions:
```sql
SELECT id, full_name, email, can_post_rooms, can_post_listings, posting_suspended_reason
FROM users WHERE can_post_rooms = 0 OR can_post_listings = 0;
```

### Check system logs:
```sql
SELECT * FROM system_logs ORDER BY id DESC LIMIT 20;
```

### Check tickets:
```sql
SELECT t.*, u.email as user_email
FROM tickets t
LEFT JOIN users u ON t.user_id = u.id
ORDER BY t.id DESC;
```

### Check SMTP settings:
```sql
SELECT smtp_host, smtp_port, from_email, encryption FROM smtp_settings LIMIT 1;
```

---

## ✅ Success Criteria

All features working when:
- ✅ Users can post rooms (if permission granted)
- ✅ Admin can approve/reject/flag rooms
- ✅ Find Room shows only approved rooms
- ✅ Find Roommate shows user profiles
- ✅ Help Center creates tickets and sends emails
- ✅ Posting access control works (can suspend users)
- ✅ Listings display with images
- ✅ Ads Manager loads and functions
- ✅ SMTP settings save correctly

---

## 📞 Need Help?

If any feature doesn't work:
1. Check browser console for JavaScript errors
2. Check PHP error logs: `c:\xampp\php\logs\php_error_log`
3. Check MySQL queries in system_logs table
4. Verify all file permissions are correct
5. Ensure XAMPP Apache and MySQL are running

---

**Last Updated:** 2025-01-XX
**Status:** All fixes implemented and tested
