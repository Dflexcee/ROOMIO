<?php
// Payment Settings API
header('Content-Type: application/json');
require_once __DIR__ . '/../../lib/UrlHelper.php';
UrlHelper::applyCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Mock payment settings data
$settings = [
    [
        'id' => 1,
        'feature_name' => 'premium_listing',
        'feature_label' => 'Premium Listing',
        'description' => 'Make your listing stand out with premium features',
        'unlock_price' => 5000,
        'is_locked' => true,
        'duration_type' => 'days',
        'duration_value' => 30
    ],
    [
        'id' => 2,
        'feature_name' => 'priority_support',
        'feature_label' => 'Priority Support',
        'description' => 'Get faster customer support response',
        'unlock_price' => 2000,
        'is_locked' => true,
        'duration_type' => 'days',
        'duration_value' => 7
    ],
    [
        'id' => 3,
        'feature_name' => 'advanced_search',
        'feature_label' => 'Advanced Search',
        'description' => 'Access to advanced search filters',
        'unlock_price' => 1000,
        'is_locked' => false,
        'duration_type' => 'days',
        'duration_value' => 1
    ]
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'success' => true,
        'settings' => $settings
    ]);
} else if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Mock save functionality
    echo json_encode([
        'success' => true,
        'message' => 'Payment settings saved successfully'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>
