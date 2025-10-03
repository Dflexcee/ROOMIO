# Browser Test Checklist - All Issues

## ✅ Test Results Show:
- Rooms List API: **WORKING** ✓
- Admin endpoints: **Require login** (this is correct security!)

## 🧪 Now Test in Your Browser

### Test 1: Login & Check Admin Pages Load

**Go to:** http://localhost:5173/admin/login

**Login with admin credentials**

Then visit each admin page and **tell me which ones show errors**:

1. http://localhost:5173/admin/posting-access
   - [ ] ✅ Page loads
   - [ ] ❌ Shows error: ___________

2. http://localhost:5173/admin/room-listings
   - [ ] ✅ Page loads
   - [ ] ❌ Shows error: ___________

3. http://localhost:5173/admin/smtp-settings
   - [ ] ✅ Page loads
   - [ ] ❌ Shows error: ___________

4. http://localhost:5173/admin/ads
   - [ ] ✅ Page loads
   - [ ] ❌ Shows error: ___________

---

### Test 2: Post Room Form (Issue #2)

**Login as regular user:** http://localhost:5173/login
**Email:** testuser@example.com

**Go to:** http://localhost:5173/post-room

**Fill the form:**
- Title: Test Room 123
- Location: Lagos
- Rent: 50000
- Gender Preference: Any
- Role: Looking for roommate
- Description: Test description

**Click Submit**

**Result:**
- [ ] ✅ Form submits successfully
- [ ] ❌ Shows validation error: ___________
- [ ] ❌ Other error: ___________

---

### Test 3: Posting Access Control (Issue #1)

**Login as admin:** http://localhost:5173/admin/login

**Go to:** http://localhost:5173/admin/posting-access

**What do you see?**
- [ ] ✅ List of users with posting permissions
- [ ] ❌ Error message: ___________
- [ ] ❌ Blank page
- [ ] ❌ 404 Not Found

**If list shows, try this:**
1. Click on a user
2. Toggle "Can Post Rooms" to OFF
3. Add reason: "Testing"
4. Save

**Result:**
- [ ] ✅ Permission saved
- [ ] ❌ Error: ___________

---

### Test 4: Find Room Page (Issue #7)

**Go to:** http://localhost:5173/find-room

**What do you see?**
- [ ] ✅ Page loads with empty message (no rooms yet)
- [ ] ✅ Page loads with rooms
- [ ] ❌ Error message: ___________
- [ ] ❌ Blank page

---

### Test 5: Find Roommate Page (Issue #7)

**Go to:** http://localhost:5173/find-roommate

**What do you see?**
- [ ] ✅ Shows user profiles
- [ ] ❌ Empty/No users
- [ ] ❌ Error message: ___________

---

### Test 6: Help Center (Issue #6)

**Login as user:** http://localhost:5173/login

**Go to:** http://localhost:5173/help-center

**Create ticket:**
- Subject: Test ticket
- Message: Testing help center

**Click Submit**

**Result:**
- [ ] ✅ Ticket created
- [ ] ❌ Error: ___________

**Then check admin:**
http://localhost:5173/admin/tickets

- [ ] ✅ Ticket appears in list
- [ ] ❌ Ticket not showing

---

## 📸 If Any Test Fails:

**Take a screenshot and tell me:**
1. Which test failed
2. What error message you see
3. Check browser console (F12 → Console tab) for errors

---

## Quick Diagnosis Guide

### If admin pages show 401/403 errors:
- Make sure you're logged in as admin
- Check cookies are enabled
- Try clearing browser cache and login again

### If post-room shows validation errors:
- Take screenshot showing which field says "required"
- Check browser console for errors

### If find-room is empty:
- This is normal - no approved rooms yet
- First post a room, then admin approve it
- Then it will show in find-room

### If find-roommate is empty:
- Need more users in database
- Register 2-3 test accounts
- Fill their profile info (gender, university, etc.)

---

## 🎯 Priority Tests

**Test these 3 FIRST and tell me results:**

1. **Post Room:** http://localhost:5173/post-room
   - Can you fill form and submit? YES/NO
   - What error shows? ___________

2. **Admin Posting Access:** http://localhost:5173/admin/posting-access
   - Does page load? YES/NO
   - Do you see users list? YES/NO
   - What error shows? ___________

3. **Find Room:** http://localhost:5173/find-room
   - Does page load? YES/NO
   - What error shows? ___________

---

**Reply with results and screenshots of any errors!**
