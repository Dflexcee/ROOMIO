<?php
// Admin Email Templates API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Mock email templates data
$templates = [
    [
        'id' => 1,
        'key' => 'welcome_email',
        'name' => 'Welcome Email',
        'subject' => 'Welcome to Roomio!',
        'body' => 'Hello {user_name}, welcome to Roomio! Please verify your email by clicking {verification_link}.'
    ],
    [
        'id' => 2,
        'key' => 'listing_interest',
        'name' => 'Listing Interest Notification',
        'subject' => 'Someone is interested in your listing',
        'body' => 'Hello {landlord_name}, {interested_user_name} is interested in your listing "{listing_title}". Contact them at {interested_user_email} or {interested_user_phone}.'
    ],
    [
        'id' => 3,
        'key' => 'password_reset',
        'name' => 'Password Reset',
        'subject' => 'Reset your password',
        'body' => 'Hello {user_name}, click this link to reset your password: {reset_link}'
    ]
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'success' => true,
        'templates' => $templates
    ]);
} else {
    echo json_encode([
        'success' => true,
        'message' => 'Template operation completed'
    ]);
}
?>