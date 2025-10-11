<?php
// Payment Settings Update API
header('Content-Type: application/json');
require_once __DIR__ . '/../../lib/UrlHelper.php';
UrlHelper::applyCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Mock successful update
    echo json_encode([
        'success' => true,
        'message' => 'Payment settings updated successfully',
        'data' => $input
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?>
