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
$feature = isset($body['feature']) ? trim($body['feature']) : '';

if ($feature === '') {
    json_response(['error' => 'Feature name is required'], 400);
    exit;
}

try {
    // Check if feature is locked
    $stmt = $pdo->prepare('SELECT is_locked FROM payment_settings WHERE feature_name = ? LIMIT 1');
    $stmt->execute([$feature]);
    $feature_info = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$feature_info || !$feature_info['is_locked']) {
        // Feature is not locked, user has access
        json_response(['hasAccess' => true, 'reason' => 'Feature is free']);
        exit;
    }
    
    // Check if user has paid access
    $stmt = $pdo->prepare('
        SELECT id FROM user_payments 
        WHERE user_id = ? AND feature_name = ? AND status = "active" 
        AND expires_at > NOW() 
        LIMIT 1
    ');
    $stmt->execute([$user_id, $feature]);
    $access = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($access) {
        json_response(['hasAccess' => true, 'reason' => 'User has paid access']);
    } else {
        json_response(['hasAccess' => false, 'reason' => 'Feature is locked and user has not paid']);
    }
    
} catch (Exception $e) {
    error_log('Access check error: ' . $e->getMessage());
    json_response(['error' => 'Database error occurred'], 500);
}
?>
