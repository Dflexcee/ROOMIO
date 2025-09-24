<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'];

// Validate required fields
if (empty($input['post_id']) || empty($input['comment'])) {
    json_response(['error' => 'Post ID and comment are required'], 400);
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO post_comments (post_id, user_id, comment, created_at) 
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([$input['post_id'], $userId, $input['comment']]);
    
    $commentId = $pdo->lastInsertId();
    
    // Get the created comment with user name
    $stmt = $pdo->prepare("
        SELECT 
            pc.*,
            u.full_name as user_name
        FROM post_comments pc
        LEFT JOIN users u ON pc.user_id = u.id
        WHERE pc.id = ?
    ");
    $stmt->execute([$commentId]);
    $comment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    json_response([
        'success' => true,
        'comment' => $comment
    ]);
    
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
