<?php
require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../lib/Auth.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

$user_id = $_SESSION['user_id'];
$body = read_json_body();
$room_id = isset($body['room_id']) ? (int)$body['room_id'] : 0;

if ($room_id <= 0) {
    json_response(['error' => 'Valid room ID is required'], 400);
    exit;
}

try {
    // Check if room exists and belongs to user
    $stmt = $pdo->prepare('SELECT id, user_id FROM rooms WHERE id = ? LIMIT 1');
    $stmt->execute([$room_id]);
    $room = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$room) {
        json_response(['error' => 'Room not found'], 404);
        exit;
    }
    
    // Check if user owns the room or is admin
    if ($room['user_id'] != $user_id) {
        // Check if user is admin
        $stmt = $pdo->prepare('SELECT role FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || $user['role'] !== 'admin') {
            json_response(['error' => 'You can only delete your own rooms'], 403);
            exit;
        }
    }
    
    // Delete the room
    $stmt = $pdo->prepare('DELETE FROM rooms WHERE id = ?');
    $stmt->execute([$room_id]);
    
    if ($stmt->rowCount() > 0) {
        json_response(['success' => true, 'message' => 'Room deleted successfully']);
    } else {
        json_response(['error' => 'Failed to delete room'], 500);
    }
    
} catch (Exception $e) {
    error_log('Room delete error: ' . $e->getMessage());
    json_response(['error' => 'Database error occurred'], 500);
}
?>
