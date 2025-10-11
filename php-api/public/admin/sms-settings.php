<?php
// Admin SMS Settings API
header('Content-Type: application/json');
require_once __DIR__ . '/../../lib/UrlHelper.php';
UrlHelper::applyCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Mock SMS settings data
$settings = [
    'api_key' => 'sk_test_1234567890abcdef',
    'from_number' => '+1234567890',
    'provider' => 'Twilio',
    'webhook_url' => 'https://roomio.com/webhooks/sms'
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
        'message' => 'SMS settings saved successfully'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>