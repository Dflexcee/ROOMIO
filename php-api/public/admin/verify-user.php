<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in and is admin
require_auth();
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['user_id']) || empty($input['status'])) {
    json_response(['error' => 'User ID and status are required'], 400);
}

$allowedStatuses = ['verified', 'rejected'];
if (!in_array($input['status'], $allowedStatuses)) {
    json_response(['error' => 'Invalid status. Must be verified or rejected'], 400);
}

try {
    // Check if user exists and is pending verification
    $stmt = $pdo->prepare("SELECT id, verification_status FROM users WHERE id = ?");
    $stmt->execute([$input['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        json_response(['error' => 'User not found'], 404);
    }
    
    if ($user['verification_status'] !== 'pending') {
        json_response(['error' => 'User is not pending verification'], 400);
    }
    
    // Update verification status
    $stmt = $pdo->prepare("UPDATE users SET verification_status = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$input['status'], $input['user_id']]);
    
    json_response([
        'success' => true,
        'message' => 'User verification status updated successfully'
    ]);
    
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
