<?php
require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

// Check if user is admin
$admin = require_admin($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['user_id'] ?? null;
$action = $input['action'] ?? null;
$reason = $input['reason'] ?? '';

if (!$userId || !$action) {
    json_response(['error' => 'Missing required fields'], 400);
    exit;
}

try {
    $pdo->beginTransaction();

    switch ($action) {
        case 'approve_verification':
            // Update user verification status
            $stmt = $pdo->prepare("
                UPDATE users
                SET is_verified = 1,
                    verification_status = 'verified',
                    verified_for_rooms = 1,
                    verified_for_listings = 1,
                    can_post_rooms = 1,
                    can_post_listings = 1
                WHERE id = ?
            ");
            $stmt->execute([$userId]);

            // Update latest verification request
            $stmt = $pdo->prepare("
                UPDATE verification_requests 
                SET status = 'approved',
                    admin_message = ?,
                    reviewed_by = ?,
                    reviewed_at = NOW()
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $stmt->execute([$reason, $admin['id'], $userId]);

            $message = 'User verification approved successfully';
            break;

        case 'reject_verification':
            $stmt = $pdo->prepare("
                UPDATE users
                SET verification_status = 'rejected',
                    is_verified = 0,
                    verified_for_rooms = 0,
                    verified_for_listings = 0,
                    can_post_rooms = 0,
                    can_post_listings = 0
                WHERE id = ?
            ");
            $stmt->execute([$userId]);

            $stmt = $pdo->prepare("
                UPDATE verification_requests
                SET status = 'rejected',
                    admin_message = ?,
                    reviewed_by = ?,
                    reviewed_at = NOW()
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 1
            ");
            $stmt->execute([$reason, $admin['id'], $userId]);

            $message = 'User verification rejected';
            break;

        case 'suspend_verification':
            $stmt = $pdo->prepare("
                UPDATE users
                SET verification_status = 'suspended',
                    verified_for_rooms = 0,
                    verified_for_listings = 0,
                    can_post_rooms = 0,
                    can_post_listings = 0
                WHERE id = ?
            ");
            $stmt->execute([$userId]);

            $stmt = $pdo->prepare("
                UPDATE verification_requests
                SET status = 'suspended',
                    admin_message = ?,
                    reviewed_by = ?,
                    reviewed_at = NOW()
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 1
            ");
            $stmt->execute([$reason, $admin['id'], $userId]);

            $message = 'User verification suspended - they must reverify';
            break;

        case 'reset_verification':
            $stmt = $pdo->prepare("
                UPDATE users 
                SET verification_status = 'pending',
                    is_verified = 0,
                    verified_for_rooms = 0,
                    verified_for_listings = 0
                WHERE id = ?
            ");
            $stmt->execute([$userId]);

            $message = 'User verification reset - they must submit verification again';
            break;

        default:
            $pdo->rollBack();
            json_response(['error' => 'Invalid action'], 400);
            exit;
    }

    $pdo->commit();

    json_response([
        'success' => true,
        'message' => $message
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Verification action error: " . $e->getMessage());
    json_response(['error' => 'Database error'], 500);
}
?>
