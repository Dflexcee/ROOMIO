<?php
// Ban User API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $email = $input['email'] ?? '';
    $reason = $input['reason'] ?? 'Violation of terms';
    
    // Mock successful ban
    echo json_encode([
        'success' => true,
        'message' => "User {$email} banned successfully",
        'data' => [
            'email' => $email,
            'reason' => $reason,
            'banned_at' => date('Y-m-d H:i:s'),
            'status' => 'banned'
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>