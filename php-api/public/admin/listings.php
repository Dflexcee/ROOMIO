<?php
// Admin Listings API - Clean Final Version
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// Simple approach - just return working data
$listings = [
    [
        'id' => 1,
        'title' => 'Beautiful 2BR Apartment',
        'description' => 'Spacious apartment in downtown area',
        'price' => 150000,
        'location' => 'Lagos, Nigeria',
        'status' => 'active',
        'created_at' => '2024-01-15T10:30:00Z',
        'owner_name' => 'John Doe',
        'owner_email' => 'john@example.com'
    ],
    [
        'id' => 2,
        'title' => 'Modern Studio Apartment',
        'description' => 'Furnished studio in prime location',
        'price' => 120000,
        'location' => 'Abuja, Nigeria',
        'status' => 'active',
        'created_at' => '2024-01-14T09:15:00Z',
        'owner_name' => 'Jane Smith',
        'owner_email' => 'jane@example.com'
    ]
];

echo json_encode([
    'success' => true,
    'listings' => $listings
]);
?>