<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

$userId = $_GET['id'] ?? null;

if (!$userId) {
    json_response(['error' => 'User ID is required'], 400);
}

try {
    $stmt = $pdo->prepare("SELECT id, full_name, email, avatar_url FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        json_response(['error' => 'User not found'], 404);
    }
    
    json_response([
        'success' => true,
        'user' => $user
    ]);
    
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
