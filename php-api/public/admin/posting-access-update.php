<?php
/**
 * Admin - Update user posting access permissions
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

// Require admin authentication
$admin = require_admin($pdo);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$user_id = (int)($input['user_id'] ?? 0);
$can_post_rooms = isset($input['can_post_rooms']) ? (int)$input['can_post_rooms'] : null;
$can_post_listings = isset($input['can_post_listings']) ? (int)$input['can_post_listings'] : null;
$reason = $input['reason'] ?? null;

if (!$user_id) {
    json_response(['error' => 'User ID required'], 400);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // Build update query dynamically
    $updates = [];
    $params = [];

    if ($can_post_rooms !== null) {
        $updates[] = "can_post_rooms = ?";
        $params[] = $can_post_rooms;
    }

    if ($can_post_listings !== null) {
        $updates[] = "can_post_listings = ?";
        $params[] = $can_post_listings;
    }

    // If blocking either posting type, add suspension details
    if (($can_post_rooms === 0 || $can_post_listings === 0) && $reason) {
        $updates[] = "posting_suspended_reason = ?";
        $updates[] = "posting_suspended_at = NOW()";
        $updates[] = "posting_suspended_by = ?";
        $params[] = $reason;
        $params[] = $admin['id'];
    } elseif ($can_post_rooms === 1 && $can_post_listings === 1) {
        // If enabling both, clear suspension details
        $updates[] = "posting_suspended_reason = NULL";
        $updates[] = "posting_suspended_at = NULL";
        $updates[] = "posting_suspended_by = NULL";
    }

    if (empty($updates)) {
        json_response(['error' => 'No updates provided'], 400);
        exit;
    }

    $params[] = $user_id;

    $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Log the action
    $logStmt = $pdo->prepare("
        INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
        VALUES (?, 'posting_access_update', ?, ?, NOW())
    ");

    $logDetails = json_encode([
        'target_user_id' => $user_id,
        'admin_id' => $admin['id'],
        'admin_email' => $admin['email'],
        'can_post_rooms' => $can_post_rooms,
        'can_post_listings' => $can_post_listings,
        'reason' => $reason
    ]);

    $logStmt->execute([
        $admin['id'],
        $logDetails,
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $pdo->commit();

    json_response([
        'success' => true,
        'message' => 'Posting access updated successfully'
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Database error in posting-access-update.php: " . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>