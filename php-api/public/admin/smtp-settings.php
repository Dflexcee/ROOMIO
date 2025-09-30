<?php
// Admin SMTP Settings API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Mock SMTP settings data
$settings = [
    'host' => 'smtp.gmail.com',
    'port' => 587,
    'username' => 'noreply@roomio.com',
    'password' => 'encrypted_password_here',
    'from_email' => 'noreply@roomio.com',
    'from_name' => 'Roomio Team'
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
        'message' => 'SMTP settings saved successfully'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>