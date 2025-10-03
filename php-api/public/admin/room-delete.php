<?php
/**
 * Admin Delete Room
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

$admin = require_admin($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$room_id = (int)($input['room_id'] ?? 0);

if (!$room_id) {
    json_response(['error' => 'Room ID required'], 400);
    exit;
}

try {
    // Log before deleting
    $stmt = $pdo->prepare("SELECT title FROM rooms WHERE id = ?");
    $stmt->execute([$room_id]);
    $room = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("DELETE FROM rooms WHERE id = ?");
    $stmt->execute([$room_id]);

    // Log action
    $stmt = $pdo->prepare("
        INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $admin['id'],
        'room_delete',
        json_encode([
            'room_id' => $room_id,
            'title' => $room['title'] ?? 'Unknown',
            'admin_email' => $admin['email']
        ]),
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    json_response(['success' => true, 'message' => 'Room deleted successfully']);
} catch (PDOException $e) {
    error_log('Room delete error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>