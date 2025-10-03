<?php
require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';

if (!isset($_SESSION['user_id'])) {
    error_log("Auth me.php: No user_id in session");
    json_response(['user' => null]);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // If user not found in database, clear the session
    if (!$user) {
        error_log("Auth me.php: User ID {$_SESSION['user_id']} not found in database - clearing session");
        session_destroy();
        json_response(['user' => null]);
        exit;
    }

    // Ensure posting permissions exist with defaults
    if (!isset($user['can_post_rooms'])) {
        $user['can_post_rooms'] = 0;
    }
    if (!isset($user['can_post_listings'])) {
        $user['can_post_listings'] = 0;
    }
    if (!isset($user['posting_suspended_reason'])) {
        $user['posting_suspended_reason'] = '';
    }

    json_response(['user' => $user]);

} catch (PDOException $e) {
    error_log("Auth me.php error: " . $e->getMessage());
    json_response(['error' => 'Database error'], 500);
} 
