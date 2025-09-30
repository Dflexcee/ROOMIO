<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

try {
    $stmt = $pdo->prepare("
        SELECT id, action, description, actor, created_at
        FROM system_logs 
        ORDER BY created_at DESC
        LIMIT 50
    ");
    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    json_response([
        'success' => true,
        'logs' => $logs
    ]);
    
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
