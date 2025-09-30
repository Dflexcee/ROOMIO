<?php
require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Config.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

// Check if user is admin
$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user || $user['role'] !== 'admin') {
    json_response(['error' => 'Admin access required'], 403);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Grant feature access to user
    $input = read_json_body();
    
    if (!isset($input['user_id']) || !isset($input['feature_name']) || !isset($input['duration'])) {
        json_response(['error' => 'Missing required fields'], 400);
        exit;
    }
    
    try {
        // Calculate expiry date
        $duration = $input['duration'];
        $expiresAt = date('Y-m-d H:i:s', strtotime("+$duration"));
        
        // Grant access
        $stmt = $pdo->prepare("
            INSERT INTO user_payments (user_id, feature_name, amount, payment_status, paid_at, expires_at, status) 
            VALUES (?, ?, 0.00, 'completed', NOW(), ?, 'active')
        ");
        $stmt->execute([$input['user_id'], $input['feature_name'], $expiresAt]);
        
        // Log the action
        $stmt = $pdo->prepare("
            INSERT INTO system_logs (action, description, actor) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([
            'grant_feature_access',
            "Granted access to feature '{$input['feature_name']}' for user {$input['user_id']}",
            $_SESSION['user_email'] ?? 'admin'
        ]);
        
        json_response(['success' => true]);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get user access for a specific user
    $userId = $_GET['user_id'] ?? null;
    
    if (!$userId) {
        json_response(['error' => 'User ID required'], 400);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("
            SELECT feature_name, paid_at, expires_at, status 
            FROM user_payments 
            WHERE user_id = ? 
            ORDER BY expires_at DESC
        ");
        $stmt->execute([$userId]);
        $access = $stmt->fetchAll();
        
        json_response(['access' => $access]);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
} else {
    json_response(['error' => 'Method not allowed'], 405);
}
?>
