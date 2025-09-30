# Verification Status vs Account Status - Complete Guide

## 🔑 **Two Independent Systems**

Roomio uses **TWO separate status systems** that control different aspects of user access:

1. **Account Status** (`users.status`) - Controls ENTIRE app access
2. **Verification Status** (`users.verification_status`) - Controls POSTING features only

---

## 1️⃣ **ACCOUNT STATUS** (`users.status`)

### Purpose
Controls whether the user can access the **entire application** (login, dashboard, browsing, messaging, etc.)

### Database Field
```sql
status ENUM('active', 'banned', 'suspended', 'inactive') DEFAULT 'active'
```

### Values & Behavior

| Status | Access Level | UI Behavior | Use Case |
|--------|--------------|-------------|----------|
| `active` | ✅ Full Access | Normal dashboard | Default for all users |
| `banned` | ❌ Completely Blocked | Red full-screen overlay | Severe violations, fraud |
| `suspended` | ❌ Temporarily Blocked | Yellow full-screen overlay + countdown | Temporary ban (48hrs) |
| `inactive` | ❌ Blocked | Gray full-screen overlay | Account deactivated |

### Where It's Checked

#### **Frontend:**
- **`UserStatusCheck` Component** (wraps entire app in `App.jsx`)
  - Shows full-screen blocking overlay for banned/suspended/inactive
  - User CANNOT access dashboard, inbox, profile, etc.
  - Only shows reason and contact support

#### **Backend:**
- **`require_auth()` function** in `/php-api/lib/Auth.php`
  - Calls `checkUserStatus()` middleware
  - Returns HTTP 403 if status is banned/suspended/inactive
  - Blocks ALL API requests

### Admin Actions
Controlled from: **`/admin/users`** (User Management page)

Actions:
- **Ban User** → Sets `status = 'banned'`
- **Suspend User** → Sets `status = 'suspended'`
- **Deactivate User** → Sets `status = 'inactive'`
- **Activate User** → Sets `status = 'active'`

---

## 2️⃣ **VERIFICATION STATUS** (`users.verification_status`)

### Purpose
Controls whether the user can **POST listings** (rooms, ads, etc.) on the platform

### Database Field
```sql
verification_status ENUM('unverified', 'pending', 'verified', 'rejected', 'suspended') DEFAULT 'unverified'
```

### Values & Behavior

| Status | Can Post? | Can Browse? | Can Message? | UI Behavior |
|--------|-----------|-------------|--------------|-------------|
| `unverified` | ❌ | ✅ | ✅ | Modal prompts verification when trying to post |
| `pending` | ❌ | ✅ | ✅ | Modal shows "waiting for approval" |
| `verified` | ✅ | ✅ | ✅ | Full posting access |
| `rejected` | ❌ | ✅ | ✅ | Modal shows rejection reason + resubmit button |
| `suspended` | ❌ | ✅ | ✅ | Modal shows suspension reason + contact support |

### Where It's Checked

#### **Frontend:**
- **`VerificationRequiredModal` Component** (used on posting pages)
  - Shows when user tries to post without verification
  - Non-intrusive modal popup (NOT full-screen block)
  - User can close modal and continue using other features

#### **Backend:**
- **NOT checked at API level** (currently)
- Posting endpoints rely on frontend checks
- ⚠️ Could be bypassed if user manipulates frontend

### Admin Actions
Controlled from: **`/admin/verification`** (Verification Management page)

Actions:
- **Approve Verification** → Sets `verification_status = 'verified'`
- **Reject Verification** → Sets `verification_status = 'rejected'`
- **Suspend Verification** → Sets `verification_status = 'suspended'`

---

## 🎯 **Key Differences**

| Aspect | Account Status | Verification Status |
|--------|---------------|---------------------|
| **Scope** | Entire app | Posting features only |
| **UI Block** | Full-screen overlay | Modal popup |
| **Can Browse Rooms** | ❌ (if banned/suspended) | ✅ (even if unverified) |
| **Can Message** | ❌ (if banned/suspended) | ✅ (even if unverified) |
| **Can Edit Profile** | ❌ (if banned/suspended) | ✅ (even if unverified) |
| **Can Post Rooms** | ❌ (if banned/suspended) | ❌ (if not verified) |
| **Bypass Option** | ❌ Never | ✅ Close modal, use other features |
| **Admin Control** | User Management page | Verification page |
| **Backend Check** | ✅ Every API request | ❌ Frontend only |
| **Refresh Rate** | Every 30 seconds | On page load |

---

## 📊 **Example Scenarios**

### Scenario 1: Unverified User
- **Account Status:** `active`
- **Verification Status:** `unverified`

**What they CAN do:**
- ✅ Login and access dashboard
- ✅ Browse rooms (Find Room page)
- ✅ Browse roommates (Find Roommate page)
- ✅ Message other users (Inbox/Chat)
- ✅ Edit profile
- ✅ Create support tickets
- ✅ View scam alerts

**What they CANNOT do:**
- ❌ Post new rooms (shows modal: "Please verify your identity first")
- ❌ Post ads (if future feature uses verification)

### Scenario 2: Verified But Suspended Account
- **Account Status:** `suspended`
- **Verification Status:** `verified`

**What they CAN do:**
- ❌ Nothing - full-screen block

**What they CANNOT do:**
- ❌ Cannot access any part of the app
- ❌ Shows full-screen yellow suspension overlay
- ❌ Only option: Contact support

**Reason:** Account status takes precedence over verification status

### Scenario 3: Verified and Active User
- **Account Status:** `active`
- **Verification Status:** `verified`

**What they CAN do:**
- ✅ Everything - full platform access
- ✅ Post unlimited rooms
- ✅ All browsing and messaging features

### Scenario 4: Rejected Verification
- **Account Status:** `active`
- **Verification Status:** `rejected`

**What they CAN do:**
- ✅ Browse, message, edit profile (all non-posting features)
- ✅ Click "Post Room" → Modal shows rejection reason
- ✅ Submit new verification request via modal

**What they CANNOT do:**
- ❌ Post rooms until new verification approved

---

## 🔧 **How to Change Status**

### As Admin - Change Account Status

1. Navigate to **`http://localhost:5173/admin/users`**
2. Find the user in the list
3. Click action dropdown:
   - **Ban** → Permanent block
   - **Suspend** → 48-hour block
   - **Deactivate** → Indefinite block
   - **Activate** → Restore access
4. Enter reason (required)
5. Confirm action

**Result:** User loses/gains app access immediately (within 30 seconds)

### As Admin - Change Verification Status

1. Navigate to **`http://localhost:5173/admin/verification`**
2. Find pending verification request
3. Review submitted documents:
   - Profile picture
   - Government ID or School ID
   - Phone number, NIN (if applicable)
4. Click action:
   - **Approve** → User can post
   - **Reject** → User sees reason, can resubmit
   - **Suspend** → User cannot post, sees reason
5. Add admin message (optional)
6. Confirm action

**Result:** User gains/loses posting ability (on next page load)

### As User - Get Verified

1. Try to post a room → Modal appears
2. Click "Start Verification Process"
3. Select account type:
   - Student
   - Tenant
   - Landlord
   - Agent
   - Individual
4. Upload required documents:
   - **Students:** School ID, admission letter, or certificate
   - **Others:** Government ID + NIN
   - **All:** Profile picture, phone number
5. Submit form
6. Wait for admin approval (usually within 48 hours)
7. Check email/dashboard for approval notification

---

## 🔒 **Security Considerations**

### Account Status
- ✅ **Backend Protected:** Checked on EVERY API request
- ✅ **Cannot Bypass:** Frontend + Backend enforcement
- ✅ **Auto-Refresh:** Frontend checks every 30 seconds
- ✅ **Session Validation:** PHP session includes current status

### Verification Status
- ⚠️ **Frontend Only:** Currently not checked in backend
- ⚠️ **Can Be Bypassed:** Technical users could manipulate frontend
- ⚠️ **No API Validation:** Room creation endpoint doesn't verify status
- ⚠️ **Recommendation:** Add backend check to room creation endpoint

### Recommended Backend Addition

Add to `/php-api/public/rooms/create-fixed.php`:

```php
// After require_auth(), add:
$user = require_auth($pdo);

// Check verification status
if ($user['verification_status'] !== 'verified') {
    json_response([
        'error' => 'Verification required',
        'verification_status' => $user['verification_status']
    ], 403);
    exit;
}
```

---

## 📝 **Database Schema**

### Users Table (Relevant Columns)

```sql
-- Account Status Fields
status ENUM('active', 'banned', 'suspended', 'inactive') DEFAULT 'active',
status_reason TEXT DEFAULT NULL,
status_changed_at TIMESTAMP NULL,
status_changed_by INT DEFAULT NULL,  -- Admin user ID who made change

-- Verification Status Fields
verification_status ENUM('unverified', 'pending', 'verified', 'rejected', 'suspended') DEFAULT 'unverified',
verification_request_id INT DEFAULT NULL,  -- Links to verification_requests table
account_type ENUM('student', 'tenant', 'landlord', 'agent', 'individual') DEFAULT 'tenant',

-- Other Fields
role ENUM('user', 'admin', 'manager') DEFAULT 'user'
```

---

## 🚨 **Common Mistakes to Avoid**

### ❌ Mistake 1: Confusing the Two Systems
**Wrong:** "User is banned, so I'll set `verification_status = 'suspended'`"
**Right:** "User is banned, so I'll set `status = 'banned'`"

### ❌ Mistake 2: Using Verification to Block Account
**Wrong:** Setting `verification_status = 'suspended'` to lock someone out
**Right:** Setting `status = 'suspended'` to lock someone out

### ❌ Mistake 3: Checking Verification in UserStatusCheck
**Wrong:** Blocking entire app based on `verification_status`
**Right:** Blocking entire app based on `status` only

### ❌ Mistake 4: Not Refreshing After Admin Changes
**Wrong:** Expecting immediate update after admin changes status
**Right:** Wait up to 30 seconds for auto-refresh, or manually reload

---

## 🎨 **UI Components Reference**

### Full-Screen Blockers (Account Status)
- **`UserStatusCheck.jsx`** - Wraps entire app
- **`UserStatusMessage.jsx`** - Displays full-screen overlays
- **Colors:**
  - Banned: Red
  - Suspended: Yellow (with countdown)
  - Inactive: Gray

### Modal Popups (Verification Status)
- **`VerificationRequiredModal.jsx`** - Reusable verification modal
- **`VerificationForm.jsx`** - Form for submitting documents
- **Used in:**
  - `PostRoom.jsx` (when clicking Submit)
  - Future posting pages (ads, services, etc.)

---

## 📞 **Support Contact**

If users encounter issues with their status:

**For Account Issues (Banned/Suspended):**
- Email: support@roomio.com
- Subject: "Account Suspension/Ban Appeal"
- Include: User ID, email, reason for appeal

**For Verification Issues (Rejected/Pending):**
- Email: verification@roomio.com
- Subject: "Verification Status Inquiry"
- Include: User ID, account type, documents submitted

---

## 🔄 **Status Change Flow Diagram**

```
User Actions → Admin Review → Status Change → Database Update → Frontend Refresh → UI Update

Example (Verification):
1. User submits verification form
2. Admin reviews in /admin/verification
3. Admin clicks "Approve"
4. verification_status set to 'verified' in DB
5. User refreshes page or auto-refresh happens
6. PostRoom page allows submission

Example (Account Ban):
1. Admin identifies policy violation
2. Admin goes to /admin/users
3. Admin clicks "Ban User" + enters reason
4. status set to 'banned' in DB
5. Within 30 seconds, user's page refreshes
6. UserStatusCheck shows full-screen ban message
7. All API requests return 403
```

---

**Last Updated:** 2025-09-29
**Version:** 2.0 (Modal-based verification system)