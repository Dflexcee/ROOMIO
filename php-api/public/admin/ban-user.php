<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in and is admin
if (!isset(require_auth();SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['email'])) {
    json_response(['error' => 'Email is required'], 400);
}

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, full_name, status FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        json_response(['error' => 'User not found'], 404);
    }
    
    if ($user['status'] === 'banned') {
        json_response(['error' => 'User is already banned'], 400);
    }
    
    // Ban the user
    $stmt = $pdo->prepare("UPDATE users SET status = 'banned', updated_at = NOW() WHERE email = ?");
    $stmt->execute([$input['email']]);
    
    // Log the action
    $adminEmail = $_SESSION['user_email'] ?? 'admin@roomio.com';
    $stmt = $pdo->prepare("
        INSERT INTO system_logs (action, description, actor, created_at) 
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([
        'ban',
        'Manually banned ' . $input['email'] . ' - ' . ($input['reason'] ?? 'No reason provided'),
        $adminEmail
    ]);
    
    json_response([
        'success' => true,
        'message' => 'User banned successfully'
    ]);
    
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
