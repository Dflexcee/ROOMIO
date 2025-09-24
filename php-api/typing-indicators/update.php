<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'];

// Validate required fields
if (empty($input['user_id']) || empty($input['target_user_id'])) {
    json_response(['error' => 'User ID and Target User ID are required'], 400);
}

// Check if the user is updating their own typing status
if ($input['user_id'] != $userId) {
    json_response(['error' => 'You can only update your own typing status'], 403);
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO typing_indicators (user_id, target_user_id, is_typing, updated_at) 
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
        is_typing = VALUES(is_typing),
        updated_at = NOW()
    ");
    $stmt->execute([
        $input['user_id'],
        $input['target_user_id'],
        $input['is_typing'] ? 1 : 0
    ]);
    
    json_response([
        'success' => true,
        'message' => 'Typing indicator updated'
    ]);
    
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
