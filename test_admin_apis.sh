#!/bin/bash

echo "=== Testing Admin API Endpoints ==="
echo ""

# Test 1: Stats
echo "1. Testing Stats API..."
RESPONSE=$(curl -s "http://localhost/roomio/php-api/public/admin/stats-working.php")
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✓ Stats API - OK"
else
    echo "   ✗ Stats API - FAILED"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 2: Users
echo "2. Testing Users API..."
RESPONSE=$(curl -s "http://localhost/roomio/php-api/public/admin/users-clean.php")
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✓ Users API - OK"
else
    echo "   ✗ Users API - FAILED"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 3: Verification Requests
echo "3. Testing Verification API..."
RESPONSE=$(curl -s "http://localhost/roomio/php-api/public/admin/verification-requests.php")
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✓ Verification API - OK"
else
    echo "   ✗ Verification API - FAILED"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 4: Ads Management
echo "4. Testing Ads API..."
RESPONSE=$(curl -s "http://localhost/roomio/php-api/public/admin/ads.php")
if echo "$RESPONSE" | grep -q '"success":true\|"ads":\['; then
    echo "   ✓ Ads API - OK"
else
    echo "   ✗ Ads API - FAILED"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 5: Listings Management
echo "5. Testing Listings Management API..."
RESPONSE=$(curl -s "http://localhost/roomio/php-api/public/admin/listings-management.php")
if echo "$RESPONSE" | grep -q '"success":true\|"listings":\['; then
    echo "   ✓ Listings Management API - OK"
else
    echo "   ✗ Listings Management API - FAILED"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 6: Rooms Management
echo "6. Testing Rooms Management API..."
RESPONSE=$(curl -s "http://localhost/roomio/php-api/public/admin/rooms-management.php")
if echo "$RESPONSE" | grep -q '"success":true\|"rooms":\['; then
    echo "   ✓ Rooms Management API - OK"
else
    echo "   ✗ Rooms Management API - FAILED"
    echo "   Response: $RESPONSE"
fi
echo ""

echo "=== Test Complete ==="
