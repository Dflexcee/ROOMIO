<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
if (!isset(require_auth();SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'];

// Validate required fields
if (empty($input['sender_id']) || empty($input['receiver_id'])) {
    json_response(['error' => 'Sender ID and Receiver ID are required'], 400);
}

// Check if the sender is the current user
if ($input['sender_id'] != $userId) {
    json_response(['error' => 'You can only send messages as yourself'], 403);
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO messages (sender_id, receiver_id, content, file_name, file_type, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $input['sender_id'],
        $input['receiver_id'],
        $input['content'] ?? '',
        $input['file_name'] ?? null,
        $input['file_type'] ?? null
    ]);
    
    $messageId = $pdo->lastInsertId();
    
    // Get the created message
    $stmt = $pdo->prepare("SELECT * FROM messages WHERE id = ?");
    $stmt->execute([$messageId]);
    $message = $stmt->fetch(PDO::FETCH_ASSOC);
    
    json_response([
        'success' => true,
        'message' => $message
    ]);
    
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
