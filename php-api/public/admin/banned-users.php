<?php
// Admin Banned Users API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Mock banned users data
$bannedUsers = [
    [
        'id' => 1,
        'user_id' => 5,
        'user_name' => 'Spam User',
        'user_email' => 'spam@example.com',
        'ban_reason' => 'Spam listings',
        'banned_by' => 'Admin User',
        'banned_at' => '2024-01-15T10:30:00Z',
        'status' => 'banned'
    ]
];

// Mock system logs data
$systemLogs = [
    [
        'id' => 1,
        'action' => 'User Login',
        'user_id' => 1,
        'user_name' => 'John Doe',
        'timestamp' => '2024-01-15T10:30:00Z',
        'ip_address' => '192.168.1.100'
    ],
    [
        'id' => 2,
        'action' => 'Room Created',
        'user_id' => 2,
        'user_name' => 'Jane Smith',
        'timestamp' => '2024-01-15T09:15:00Z',
        'ip_address' => '192.168.1.101'
    ]
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'success' => true,
        'banned_users' => $bannedUsers,
        'system_logs' => $systemLogs
    ]);
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Mock ban user functionality
    echo json_encode([
        'success' => true,
        'message' => 'User banned successfully'
    ]);
} else {
    echo json_encode([
        'success' => true,
        'message' => 'Operation completed'
    ]);
}
?>