<?php
/**
 * Admin Room Listings Management
 * GET - List all rooms
 * PUT - Update room status (approve/reject/suspend)
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

// Require admin authentication
$admin = require_admin($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get all rooms with user information
        $stmt = $pdo->prepare("
            SELECT
                r.*,
                u.full_name as owner_name,
                u.email as owner_email,
                u.avatar_url as owner_avatar,
                u.phone as owner_phone
            FROM rooms r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
        ");
        $stmt->execute();
        $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Parse JSON fields
        foreach ($rooms as &$room) {
            if (isset($room['images']) && is_string($room['images'])) {
                $room['images'] = json_decode($room['images'], true) ?: [];
            }
            if (isset($room['amenities']) && is_string($room['amenities'])) {
                $room['amenities'] = json_decode($room['amenities'], true) ?: [];
            }
        }

        json_response([
            'success' => true,
            'rooms' => $rooms,
            'total' => count($rooms)
        ]);

    } catch (PDOException $e) {
        error_log('Admin rooms fetch error: ' . $e->getMessage());
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $room_id = (int)($input['room_id'] ?? 0);
    $action = $input['action'] ?? '';
    $reason = isset($input['reason']) ? trim($input['reason']) : '';

    if (!$room_id || !$action) {
        json_response(['error' => 'Room ID and action are required'], 400);
        exit;
    }

    try {
        // Get current room
        $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
        $stmt->execute([$room_id]);
        $room = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$room) {
            json_response(['error' => 'Room not found'], 404);
            exit;
        }

        $newStatus = '';
        $message = '';

        switch ($action) {
            case 'approve':
                $newStatus = 'approved';
                $message = 'Room approved successfully';
                break;

            case 'reject':
                $newStatus = 'rejected';
                $message = 'Room rejected';
                break;

            case 'flag':
                $newStatus = 'flagged';
                $message = 'Room flagged';
                break;

            case 'pending':
                $newStatus = 'pending';
                $message = 'Room set to pending';
                break;

            default:
                json_response(['error' => 'Invalid action'], 400);
                exit;
        }

        // Update room status
        $stmt = $pdo->prepare("
            UPDATE rooms
            SET status = ?,
                status_reason = ?,
                status_changed_by = ?,
                status_changed_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$newStatus, $reason, $admin['id'], $room_id]);

        // Log the action
        $stmt = $pdo->prepare("
            INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $admin['id'],
            "room_$action",
            json_encode([
                'room_id' => $room_id,
                'action' => $action,
                'reason' => $reason,
                'new_status' => $newStatus,
                'admin_email' => $admin['email']
            ]),
            $_SERVER['REMOTE_ADDR'] ?? null
        ]);

        json_response([
            'success' => true,
            'message' => $message,
            'room_id' => $room_id,
            'new_status' => $newStatus
        ]);

    } catch (PDOException $e) {
        error_log('Room status update error: ' . $e->getMessage());
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

else {
    json_response(['error' => 'Method not allowed'], 405);
}
?>