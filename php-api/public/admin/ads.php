<?php
// Admin Ads API
header('Content-Type: application/json');
require_once __DIR__ . '/../../lib/UrlHelper.php';
UrlHelper::applyCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Mock ads data
$ads = [
    [
        'id' => 1,
        'title' => 'Premium Room Listing',
        'image_url' => '/uploads/ads/ad1.jpg',
        'target_listing' => 'All Listings',
        'status' => 'active',
        'created_at' => '2024-01-15T10:30:00Z'
    ],
    [
        'id' => 2,
        'title' => 'Roomio Pro Features',
        'image_url' => '/uploads/ads/ad2.jpg',
        'target_listing' => 'Premium Listings',
        'status' => 'active',
        'created_at' => '2024-01-14T14:20:00Z'
    ]
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'success' => true,
        'ads' => $ads
    ]);
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Mock create ad functionality
    echo json_encode([
        'success' => true,
        'message' => 'Ad created successfully'
    ]);
} else {
    echo json_encode([
        'success' => true,
        'message' => 'Ad operation completed'
    ]);
}
?>