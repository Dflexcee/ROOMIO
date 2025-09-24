<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

$senderId = $_GET['sender_id'] ?? null;
$receiverId = $_GET['receiver_id'] ?? null;

if (!$senderId || !$receiverId) {
    json_response(['error' => 'Sender ID and Receiver ID are required'], 400);
}

try {
    $stmt = $pdo->prepare("
        SELECT * FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) 
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at ASC
    ");
    $stmt->execute([$senderId, $receiverId, $receiverId, $senderId]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    json_response([
        'success' => true,
        'messages' => $messages
    ]);
    
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
