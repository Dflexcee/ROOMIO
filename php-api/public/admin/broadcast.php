<?php
// Admin Broadcast API
header('Content-Type: application/json');
require_once __DIR__ . '/../../lib/UrlHelper.php';
UrlHelper::applyCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Mock broadcast history data
$broadcasts = [
    [
        'id' => 1,
        'subject' => 'Welcome to Roomio!',
        'body' => 'Thank you for joining Roomio. Start exploring rooms now!',
        'channel' => 'email',
        'audience' => 'all',
        'target_count' => 150,
        'sent_at' => '2024-01-15T10:30:00Z',
        'status' => 'sent'
    ],
    [
        'id' => 2,
        'subject' => 'New Features Available',
        'body' => 'Check out our new features including advanced search and filters.',
        'channel' => 'email',
        'audience' => 'verified',
        'target_count' => 75,
        'sent_at' => '2024-01-14T14:20:00Z',
        'status' => 'sent'
    ]
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'success' => true,
        'broadcasts' => $broadcasts
    ]);
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Mock send broadcast functionality
    $input = json_decode(file_get_contents('php://input'), true);
    
    echo json_encode([
        'success' => true,
        'message' => 'Broadcast sent successfully',
        'results' => [
            'success' => 100,
            'failed' => 0
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>