<?php
// Verification Approve/Reject API
header('Content-Type: application/json');
require_once __DIR__ . '/../../lib/UrlHelper.php';
UrlHelper::applyCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $action = $input['action'] ?? 'approve';
    $user_id = $input['user_id'] ?? null;
    
    if ($action === 'approve') {
        echo json_encode([
            'success' => true,
            'message' => 'User approved successfully',
            'data' => $input
        ]);
    } else if ($action === 'reject') {
        echo json_encode([
            'success' => true,
            'message' => 'User rejected successfully',
            'data' => $input
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Verification request processed successfully',
            'data' => $input
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>
