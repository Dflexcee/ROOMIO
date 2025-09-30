# User Access Control Fix - Documentation

## Problem Fixed

**Issue**: Suspended/deactivated/banned users could still access protected routes like `/post-room` even after admin changed their status.

## Root Causes Identified

1. **Missing Route Protection**: `/post-room` route was NOT wrapped with `ProtectedRoute` component
2. **Stale User Context**: Frontend didn't refresh user data after admin status changes
3. **Dual Status Systems**: Two separate status fields (`status` vs `verification_status`) caused confusion
4. **No Backend Validation**: API endpoints didn't re-check user status on each request
5. **Mixed Status Logic**: Page-level checks only verified `verification_status`, not account `status`

## Solution Implementation

### 1. Frontend Changes

#### A. Route Protection ([src/routes/AppRoutes.jsx:59](src/routes/AppRoutes.jsx#L59))
```jsx
// BEFORE:
<Route path="/post-room" element={<PostRoom />} />

// AFTER:
<Route path="/post-room" element={<ProtectedRoute><PostRoom /></ProtectedRoute>} />
```

**Impact**: Now requires authentication to access the route.

---

#### B. Enhanced Status Validation ([src/components/common/UserStatusCheck.jsx](src/components/common/UserStatusCheck.jsx))

**Changes**:
- Added periodic status refresh (every 30 seconds) for non-admin users
- Check both `user.status` AND `user.verification_status`
- Display appropriate message based on status type
- Auto-detect status changes and update UI immediately

**Status Priority**:
1. **Account Status** (highest priority): `banned` > `suspended` > `inactive`
2. **Verification Status**: `suspended` verification

---

#### C. Page-Level Status Checks ([src/pages/PostRoom.jsx](src/pages/PostRoom.jsx))

**New Function**:
```jsx
const checkAccountStatus = () => {
  if (user.status === 'banned' || user.status === 'suspended' || user.status === 'inactive') {
    console.log('User account status blocked:', user.status);
    return false; // UserStatusCheck will show full-screen message
  }
  return true;
};
```

**Impact**: Page now checks account status BEFORE verification status.

---

#### D. Auto-Refresh User Context ([src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx))

**Enhanced `refreshUser()` Function**:
- Logs when user status/verification changes
- Detects banned/suspended/inactive transitions
- Updates user state with fresh database data

**Used by**: `UserStatusCheck` component calls this every 30 seconds.

---

### 2. Backend Changes

#### A. Status Validation Middleware ([php-api/middleware/check-user-status.php](php-api/middleware/check-user-status.php))

**Functions**:
1. `checkUserStatus($pdo, $user_id, $exclude_admin = true)`:
   - Checks current user status from database
   - Returns 403 with reason if banned/suspended/inactive
   - Exits script if status invalid
   - Returns user data if status valid

2. `isUserStatusValid($pdo, $user_id, $exclude_admin = true)`:
   - Quick boolean check without exiting
   - Useful for conditional logic

**Status Checks**:
- ✅ Banned → HTTP 403 + `ACCOUNT_BANNED`
- ✅ Suspended → HTTP 403 + `ACCOUNT_SUSPENDED`
- ✅ Inactive → HTTP 403 + `ACCOUNT_INACTIVE`
- ✅ Verification Suspended → HTTP 403 + `VERIFICATION_SUSPENDED`

---

#### B. Updated Authentication Library ([php-api/lib/Auth.php](php-api/lib/Auth.php))

**Enhanced `require_auth()` Function**:
```php
function require_auth(PDO $pdo, bool $check_status = true): array {
    if (!isset($_SESSION['user_id'])) {
        json_response(['error' => 'Not authenticated'], 401);
        exit;
    }

    // Use status check middleware (default: enabled)
    if ($check_status) {
        $user = checkUserStatus($pdo, $_SESSION['user_id'], true);
        return $user;
    }

    // Fallback: basic auth without status check
    // ...
}
```

**Impact**: ALL API endpoints using `require_auth()` now validate user status on every request.

---

#### C. Bootstrap Integration ([php-api/bootstrap.php](php-api/bootstrap.php))

**Added**:
```php
// Load user status validation middleware
require_once __DIR__ . '/middleware/check-user-status.php';
```

**Impact**: Middleware available globally to all API endpoints.

---

## Status Field Reference

| Field | Purpose | Values | Controlled By |
|-------|---------|--------|---------------|
| `status` | Account-level access control | `active`, `banned`, `suspended`, `inactive` | Admin via user management |
| `verification_status` | Identity verification state | `unverified`, `pending`, `verified`, `rejected`, `suspended` | Admin via verification review |
| `status_reason` | Explanation for status change | Text/NULL | Admin when changing status |
| `status_changed_at` | Timestamp of last change | DateTime/NULL | Auto-set when status changes |
| `status_changed_by` | Admin who made the change | User ID/NULL | Admin user ID |

---

## Testing Guide

### Test Case 1: Admin Suspends User

**Steps**:
1. Login as regular user
2. Navigate to `/post-room` - should work
3. Admin logs in, goes to Users management
4. Admin suspends the user with reason "Testing suspension"
5. **Within 30 seconds**, the user's page should refresh and show suspension message

**Expected Result**:
- User sees full-screen yellow suspension overlay
- Shows countdown timer (if applicable)
- Shows reason: "Testing suspension"
- Cannot access any protected routes
- All API requests return 403

---

### Test Case 2: Admin Bans User

**Steps**:
1. Login as regular user
2. Access dashboard
3. Admin bans user with reason "Violation of terms"
4. User refreshes or navigates to any page

**Expected Result**:
- User sees full-screen red ban overlay
- Shows reason: "Violation of terms"
- No countdown timer (permanent)
- Cannot make any API requests
- Session remains but all access denied

---

### Test Case 3: Admin Deactivates User

**Steps**:
1. Login as regular user
2. Access `/post-room`
3. Admin deactivates (sets status to `inactive`)
4. User attempts to submit room listing

**Expected Result**:
- Frontend: Shows gray deactivation overlay
- Backend: API returns 403 with `ACCOUNT_INACTIVE`
- Form submission blocked
- Message: "Contact support to reactivate"

---

### Test Case 4: Verification Suspended

**Steps**:
1. Login as verified user
2. Navigate to `/post-room`
3. Admin suspends verification (not account)
4. User refreshes page

**Expected Result**:
- User sees suspension message on `/post-room` page
- Can access other routes (dashboard, profile, etc.)
- Cannot post new listings
- Shows verification suspension reason

---

### Test Case 5: Status Changes While User Active

**Steps**:
1. Login as user
2. Leave browser tab open on `/dashboard`
3. Admin suspends user
4. Wait 30 seconds (auto-refresh interval)

**Expected Result**:
- After 30 seconds, user sees suspension overlay automatically
- Console logs show: "Refreshing user status..."
- Console logs show: "User status changed from active to suspended"
- No manual refresh needed

---

### Test Case 6: Admin/Manager Bypass

**Steps**:
1. Login as admin
2. Another admin sets your status to "suspended"
3. Continue using admin panel

**Expected Result**:
- Admin can still access all features
- Status checks bypassed for admin/manager roles
- No restrictions applied
- Can manage other users normally

---

## API Error Response Format

When user status is invalid, APIs return:

```json
{
  "success": false,
  "error": "Your account has been suspended",
  "status_code": "ACCOUNT_SUSPENDED",
  "status": "suspended",
  "reason": "Reason provided by admin",
  "changed_at": "2025-09-29 12:34:56"
}
```

**Status Codes**:
- `NO_SESSION` - Not logged in
- `USER_NOT_FOUND` - User doesn't exist
- `ACCOUNT_BANNED` - Account permanently banned
- `ACCOUNT_SUSPENDED` - Account temporarily suspended
- `ACCOUNT_INACTIVE` - Account deactivated
- `VERIFICATION_SUSPENDED` - Verification suspended
- `DATABASE_ERROR` - Server error

---

## Files Modified

### Frontend
1. ✅ [src/routes/AppRoutes.jsx](src/routes/AppRoutes.jsx) - Added ProtectedRoute to `/post-room`
2. ✅ [src/components/common/UserStatusCheck.jsx](src/components/common/UserStatusCheck.jsx) - Enhanced status validation + auto-refresh
3. ✅ [src/pages/PostRoom.jsx](src/pages/PostRoom.jsx) - Added account status check
4. ✅ [src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx) - Enhanced refreshUser with status change detection

### Backend
5. ✅ [php-api/middleware/check-user-status.php](php-api/middleware/check-user-status.php) - NEW: Status validation middleware
6. ✅ [php-api/lib/Auth.php](php-api/lib/Auth.php) - Updated require_auth to use status middleware
7. ✅ [php-api/bootstrap.php](php-api/bootstrap.php) - Load status middleware globally

---

## How It Works (Flow Diagram)

```
User Access Flow (Suspended User):

1. User loads page
   ↓
2. AuthContext checks session → calls /auth/me.php
   ↓
3. Backend returns user with status="suspended"
   ↓
4. UserStatusCheck component detects status="suspended"
   ↓
5. Shows full-screen suspension overlay
   ↓
6. Auto-refresh every 30 seconds (checks for status changes)
   ↓
7. If user tries API request:
   - require_auth() called
   - checkUserStatus() middleware runs
   - Returns 403 + reason
   - Request blocked
```

---

## Database Fields Required

Ensure these columns exist in `users` table:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('active','banned','suspended','inactive') DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status ENUM('unverified','pending','verified','rejected','suspended') DEFAULT 'unverified';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_reason TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_changed_by INT DEFAULT NULL;
```

---

## Admin Actions Required

When admin changes user status, ensure:

1. ✅ Set `status` field to new value
2. ✅ Set `status_reason` with explanation
3. ✅ Set `status_changed_at` to NOW()
4. ✅ Set `status_changed_by` to admin's user ID
5. ✅ (Optional) Send email notification to user

---

## Troubleshooting

### Issue: User still has access after suspension
**Solution**:
- Check if auto-refresh is working (console logs every 30s)
- Verify `status` field in database is actually "suspended"
- Check if user role is "admin" (admins bypass checks)

### Issue: 403 errors on all API requests
**Solution**:
- Check `status` field in users table
- Ensure middleware is loaded in bootstrap.php
- Verify session is valid with user_id

### Issue: Status overlay not showing
**Solution**:
- Verify UserStatusCheck wraps App in App.jsx
- Check console for user status logs
- Refresh page manually to trigger status check

---

## Future Enhancements

1. **Suspension Timer**: Auto-unsuspend after X hours
2. **Email Notifications**: Alert users when status changes
3. **Audit Log**: Track all status changes in system_logs table
4. **WebSocket**: Real-time status updates without polling
5. **Grace Period**: Allow users to appeal before complete lockout

---

## Security Notes

- ✅ Admin/Manager roles bypass status checks (required for administration)
- ✅ Status validated on EVERY protected API request
- ✅ Frontend checks prevent UI access
- ✅ Backend checks prevent API abuse
- ✅ Session persists but access denied (allows showing reason)
- ✅ No data leakage (user can't see protected data while suspended)

---

## Support Contact

If suspended users need assistance:
- Email: support@roomio.com
- Phone: [Your support number]
- Help Center: `/help-center` (still accessible)

---

**Implementation Date**: 2025-09-29
**Status**: ✅ Complete and Ready for Testing