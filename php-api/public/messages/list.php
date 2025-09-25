<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

$userId = $_SESSION['user_id'];

try {
    // Get all messages for this user (both sent and received)
    $stmt = $pdo->prepare("
        SELECT 
            m.*,
            s.full_name as sender_name,
            s.avatar_url as sender_avatar,
            r.full_name as receiver_name,
            r.avatar_url as receiver_avatar
        FROM messages m
        LEFT JOIN users s ON m.sender_id = s.id
        LEFT JOIN users r ON m.receiver_id = r.id
        WHERE m.sender_id = ? OR m.receiver_id = ?
        ORDER BY m.created_at DESC
    ");
    $stmt->execute([$userId, $userId]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    json_response([
        'success' => true,
        'messages' => $messages
    ]);
    
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
