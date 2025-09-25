<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
if (!isset(require_auth();SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

try {
    // Get posts with user names
    $stmt = $pdo->query("
        SELECT 
            cp.*,
            u.full_name as user_name
        FROM community_posts cp
        LEFT JOIN users u ON cp.user_id = u.id
        ORDER BY cp.created_at DESC
        LIMIT 10
    ");
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get comments with user names
    $stmt = $pdo->query("
        SELECT 
            pc.*,
            u.full_name as user_name
        FROM post_comments pc
        LEFT JOIN users u ON pc.user_id = u.id
        ORDER BY pc.created_at ASC
    ");
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Group comments by post_id
    $groupedComments = [];
    foreach ($comments as $comment) {
        if (!isset($groupedComments[$comment['post_id']])) {
            $groupedComments[$comment['post_id']] = [];
        }
        $groupedComments[$comment['post_id']][] = $comment;
    }
    
    json_response([
        'success' => true,
        'posts' => $posts,
        'comments' => $groupedComments
    ]);
    
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
