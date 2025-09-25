<?php
require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../lib/Auth.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

$user_id = $_SESSION['user_id'];
$body = read_json_body();
$recipient_id = isset($body['recipient_id']) ? (int)$body['recipient_id'] : 0;
$is_typing = isset($body['is_typing']) ? (bool)$body['is_typing'] : false;

if ($recipient_id <= 0) {
    json_response(['error' => 'Valid recipient ID is required'], 400);
    exit;
}

try {
    if ($is_typing) {
        // Insert or update typing indicator
        $stmt = $pdo->prepare('
            INSERT INTO typing_indicators (user_id, recipient_id, is_typing, updated_at) 
            VALUES (?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE is_typing = 1, updated_at = NOW()
        ');
        $stmt->execute([$user_id, $recipient_id]);
    } else {
        // Remove typing indicator
        $stmt = $pdo->prepare('DELETE FROM typing_indicators WHERE user_id = ? AND recipient_id = ?');
        $stmt->execute([$user_id, $recipient_id]);
    }
    
    json_response(['success' => true, 'is_typing' => $is_typing]);
    
} catch (Exception $e) {
    error_log('Typing indicator error: ' . $e->getMessage());
    json_response(['error' => 'Database error occurred'], 500);
}
?>
