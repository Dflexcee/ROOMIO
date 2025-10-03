# 🚨 REMAINING FIXES TO COMPLETE

## ✅ COMPLETED SO FAR
1. ✅ Added routes for PostListing, ViewListings, MyListings
2. ✅ Created Admin AllListingsManagement page with CRUD

## 🔴 CRITICAL FIXES NEEDED

### 1. Admin Routes - Add AllListingsManagement
**File**: `src/routes/AdminRoutes.jsx`
**Add**:
```jsx
import AllListingsManagement from '../pages/admin/AllListingsManagement';

// In routes:
<Route path="all-listings" element={<AllListingsManagement />} />
```

### 2. Create Admin Listing Edit/Delete Endpoints
**Create**: `php-api/public/admin/listing-edit.php`
```php
<?php
require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

$admin = require_admin($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$listing_id = (int)($input['listing_id'] ?? 0);

if (!$listing_id) {
    json_response(['error' => 'Listing ID required'], 400);
    exit;
}

try {
    $stmt = $pdo->prepare("
        UPDATE listings
        SET title = ?, description = ?, price = ?, location = ?,
            contact_phone = ?, contact_email = ?, updated_at = NOW()
        WHERE id = ?
    ");

    $stmt->execute([
        $input['title'],
        $input['description'],
        $input['price'],
        $input['location'],
        $input['contact_phone'],
        $input['contact_email'],
        $listing_id
    ]);

    json_response(['success' => true, 'message' => 'Listing updated']);
} catch (PDOException $e) {
    json_response(['error' => $e->getMessage()], 500);
}
?>
```

**Create**: `php-api/public/admin/listing-delete.php`
```php
<?php
require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

$admin = require_admin($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$listing_id = (int)($input['listing_id'] ?? 0);

try {
    $stmt = $pdo->prepare("DELETE FROM listings WHERE id = ?");
    $stmt->execute([$listing_id]);

    json_response(['success' => true, 'message' => 'Listing deleted']);
} catch (PDOException $e) {
    json_response(['error' => $e->getMessage()], 500);
}
?>
```

### 3. Add Edit Modal to RoomListings.jsx
**File**: `src/pages/admin/RoomListings.jsx`
**Add similar edit modal as AllListingsManagement**
- Copy the edit modal code
- Add edit button to room actions
- Create endpoint `/admin/room-edit.php`

### 4. Fix FindRoommate - Show Avatars and Full Details
**File**: `src/pages/FindRoommate.jsx`
**Check line ~50+**: Ensure avatars are displayed in cards
**Add**: Full profile modal showing all pictures when clicking "View Profile"

### 5. Add 4 Extra Image Fields to PostRoom
**File**: `src/pages/PostRoom.jsx`
**Find**: Image upload section (around line 200)
**Add**: 4 more file inputs:
```jsx
<input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 1)} />
<input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 2)} />
<input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 3)} />
<input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 4)} />
```

### 6. Fix Chat File Display
**File**: `src/pages/ChatDetail.jsx`
**Find**: Message rendering section (around line 150)
**Add**: Check if message has file_url, display as link or image:
```jsx
{message.file_url && (
  message.file_type?.startsWith('image/') ? (
    <img src={message.file_url} alt="attachment" className="max-w-xs rounded" />
  ) : (
    <a href={message.file_url} target="_blank" className="text-blue-500 underline">
      📎 {message.file_name || 'Download file'}
    </a>
  )
)}
```

### 7. Fix Help Center Ticket Submission
**File**: `src/pages/HelpCenter.jsx`
**Issue**: Form submission not working
**Check**:
- Line ~80: handleSubmit function
- Ensure fetch to `/tickets/create.php`
- Check credentials: 'include'
- Check Content-Type header

**Likely fix needed**:
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(config.getUrl(config.endpoints.tickets.create), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        subject: subject,
        priority: priority,
        message: message
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Ticket created successfully!');
      setSubject('');
      setMessage('');
      fetchTickets(); // Refresh list
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};
```

### 8. Fix Admin Ads Manager
**File**: `src/pages/admin/AdsManager.jsx`
**Required**:
- Create ads CRUD
- Create ads popup component for user dashboard
- Store ads in database table

**Create table**:
```sql
CREATE TABLE IF NOT EXISTS ads (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    link_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATETIME,
    end_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Create**: `src/components/common/AdPopup.jsx`
```jsx
import React, { useState, useEffect } from 'react';

export default function AdPopup() {
  const [ad, setAd] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetchActiveAd();
  }, []);

  const fetchActiveAd = async () => {
    try {
      const response = await fetch('/php-api/public/ads/active.php');
      const data = await response.json();
      if (response.ok && data.ad) {
        setAd(data.ad);
        setShow(true);
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
    }
  };

  if (!show || !ad) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md relative">
        <button
          onClick={() => setShow(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
        {ad.image_url && (
          <img src={ad.image_url} alt={ad.title} className="w-full h-48 object-cover rounded mb-4" />
        )}
        <h3 className="text-xl font-bold mb-2">{ad.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{ad.description}</p>
        {ad.link_url && (
          <a
            href={ad.link_url}
            target="_blank"
            className="block w-full py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700"
          >
            Learn More
          </a>
        )}
      </div>
    </div>
  );
}
```

**Add to Dashboard.jsx**:
```jsx
import AdPopup from '../components/common/AdPopup';

// In component:
<AdPopup />
```

### 9. Create Admin User Posting Access Management
**Create**: `src/pages/admin/UserPostingAccess.jsx`
**Similar to**: VerificationManagement.jsx
**Features**:
- List all users
- Toggle "can_post_listings" permission
- Set expiry date for posting access
- Show payment status

**Add column to users table**:
```sql
ALTER TABLE users
ADD COLUMN can_post_listings BOOLEAN DEFAULT FALSE,
ADD COLUMN posting_access_expires DATETIME NULL;
```

### 10. Premium Features System
**Check**: If payment integration exists
**Files to review**:
- `src/pages/admin/PaymentGatewaySettings.jsx`
- `src/pages/admin/Payments.jsx`
- `src/pages/admin/GrantFeatureAccess.jsx`

**Ensure**:
- Payment gateway configured
- Feature flags in database
- Expiry system working

---

## 📋 NAVIGATION UPDATES NEEDED

### User Navbar
**File**: `src/components/common/Navbar.jsx`
**Add these links**:
```jsx
<Link to="/post-listing">Post Listing</Link>
<Link to="/view-listings">View Listings</Link>
<Link to="/my-listings">My Listings</Link>
```

### Admin Sidebar/Nav
**Add**:
- All Listings Management → `/admin/all-listings`
- User Posting Access → `/admin/user-posting-access`
- Change "Listings" to "Room Listings"

---

## 🧪 TESTING CHECKLIST

After completing above:

- [ ] All admin pages load
- [ ] Can edit and delete rooms
- [ ] Can edit and delete listings
- [ ] Find Roommate shows avatars
- [ ] Post Room accepts 4+ images
- [ ] Chat displays file attachments
- [ ] Help Center submits tickets
- [ ] Ads popup shows on dashboard
- [ ] User posting access works
- [ ] All navigation links work

---

## ⚡ QUICK IMPLEMENTATION ORDER

1. **NOW** (30 min): Add admin routes, create edit/delete endpoints
2. **TODAY** (1 hour): Fix Help Center, Chat files, FindRoommate
3. **THIS WEEK** (2 hours): Ads system, User posting access
4. **NEXT** (3 hours): Premium features review

---

## 📞 FILES THAT NEED UPDATES

1. `src/routes/AdminRoutes.jsx` - Add AllListingsManagement route
2. `src/components/common/Navbar.jsx` - Add new links
3. `src/pages/FindRoommate.jsx` - Fix avatar display
4. `src/pages/PostRoom.jsx` - Add extra image fields
5. `src/pages/ChatDetail.jsx` - Add file display
6. `src/pages/HelpCenter.jsx` - Fix submission
7. `src/pages/admin/RoomListings.jsx` - Add edit modal
8. `src/pages/admin/AdsManager.jsx` - Rewrite completely
9. Create: `src/pages/admin/UserPostingAccess.jsx`
10. Create: `src/components/common/AdPopup.jsx`
11. Create: `php-api/public/admin/listing-edit.php`
12. Create: `php-api/public/admin/listing-delete.php`
13. Create: `php-api/public/admin/room-edit.php`
14. Create: `php-api/public/ads/active.php`

---

**All backend endpoints are ready. Just need to wire up the frontend components and fix the specific issues listed above.**