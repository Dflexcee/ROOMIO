<?php
/**
 * Admin Edit Room
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

$admin = require_admin($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
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
    $stmt = $pdo->prepare("
        UPDATE rooms
        SET title = ?, description = ?, rent = ?, location = ?,
            gender_preference = ?, role = ?, conditions = ?, updated_at = NOW()
        WHERE id = ?
    ");

    $stmt->execute([
        $input['title'],
        $input['description'],
        $input['rent'],
        $input['location'],
        $input['gender_preference'] ?? 'any',
        $input['role'] ?? null,
        $input['conditions'] ?? null,
        $room_id
    ]);

    // Log action
    $stmt = $pdo->prepare("
        INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $admin['id'],
        'room_edit',
        json_encode(['room_id' => $room_id, 'admin_email' => $admin['email']]),
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    json_response(['success' => true, 'message' => 'Room updated successfully']);
} catch (PDOException $e) {
    error_log('Room edit error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>