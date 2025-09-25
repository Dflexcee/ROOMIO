<?php
require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../lib/Auth.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

try {
    // Get all users except banned ones - only select columns that exist
    $stmt = $pdo->prepare('
        SELECT 
            id, 
            email, 
            role,
            created_at
        FROM users 
        WHERE role != "banned" 
        ORDER BY created_at DESC
    ');
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    json_response(['users' => $users]);
    
} catch (Exception $e) {
    error_log('Users list error: ' . $e->getMessage());
    json_response(['error' => 'Database error occurred'], 500);
}
?>
