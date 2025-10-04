# Remaining Currency Updates

## Completed (5/19):
✅ ProfileEdit.jsx
✅ PostRoom.jsx
✅ PostListing.jsx
✅ FindRoommate.jsx (4 instances)

## Pattern to Follow for Remaining 14 Files:

### Step 1: Add import
```javascript
import { useCurrency } from '../contexts/CurrencyContext';
// or for files in subdirectories:
import { useCurrency } from '../../contexts/CurrencyContext';
```

### Step 2: Add hook in component
```javascript
const { currency } = useCurrency();
```

### Step 3: Replace ₦ with
```javascript
{currency.currency_symbol}
```

## Remaining Files to Update:

1. **FindRoom.jsx** - Replace ₦ in room listings
2. **ViewListings.jsx** - Replace ₦ in listing displays
3. **MyRooms.jsx** - Replace ₦ in user's room list
4. **MyListings.jsx** - Replace ₦ in user's listing list
5. **EditRoom.jsx** - Replace ₦ in edit form
6. **EditListing.jsx** - Replace ₦ in edit form
7. **ProfileSetup.jsx** - Replace ₦ in budget ranges
8. **admin/AllListingsManagement.jsx** - Replace ₦
9. **admin/RoomListings.jsx** - Replace ₦
10. **admin/Payments.jsx** - Replace ₦
11. **admin/UserAccessManager.jsx** - Replace ₦
12. **admin/GrantFeatureAccess.jsx** - Replace ₦
13. **admin/ListingsSimple.jsx** - Replace ₦
14. **components/common/PaywallPrompt.jsx** - Replace ₦

Note: CurrencySettings.jsx is admin page for managing currency - doesn't need update
