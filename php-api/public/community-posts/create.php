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
if (empty($input['content'])) {
    json_response(['error' => 'Content is required'], 400);
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO community_posts (user_id, content, created_at) 
        VALUES (?, ?, NOW())
    ");
    $stmt->execute([$userId, $input['content']]);
    
    $postId = $pdo->lastInsertId();
    
    // Get the created post with user name
    $stmt = $pdo->prepare("
        SELECT 
            cp.*,
            u.full_name as user_name
        FROM community_posts cp
        LEFT JOIN users u ON cp.user_id = u.id
        WHERE cp.id = ?
    ");
    $stmt->execute([$postId]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    json_response([
        'success' => true,
        'post' => $post
    ]);
    
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
