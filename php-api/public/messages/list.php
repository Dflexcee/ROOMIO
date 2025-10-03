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
    // Check which columns exist in messages table
    $stmt = $pdo->query("SHOW COLUMNS FROM messages");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Build SELECT query based on existing columns
    $selectFields = ['m.id', 'm.sender_id', 'm.receiver_id', 'm.content', 'm.is_read', 'm.created_at'];

    if (in_array('file_name', $columns)) {
        $selectFields[] = 'm.file_name';
    }
    if (in_array('file_type', $columns)) {
        $selectFields[] = 'm.file_type';
    }
    if (in_array('file_url', $columns)) {
        $selectFields[] = 'm.file_url';
    }

    $selectFields[] = 's.full_name as sender_name';
    $selectFields[] = 's.avatar_url as sender_avatar';
    $selectFields[] = 'r.full_name as receiver_name';
    $selectFields[] = 'r.avatar_url as receiver_avatar';

    $selectStr = implode(', ', $selectFields);

    // Get all messages for this user (both sent and received)
    $stmt = $pdo->prepare("
        SELECT $selectStr
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
