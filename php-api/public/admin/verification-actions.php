<?php
/**
 * Admin Verification Actions
 *
 * This endpoint handles verification-specific actions (approve/reject/suspend)
 * ONLY affects verification_status, NOT account status
 * This allows users to keep using the app but prevents posting
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

// Require admin authentication
$admin = require_admin($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$user_id = (int)($input['user_id'] ?? 0);
$action = $input['action'] ?? '';
$scope = $input['scope'] ?? 'global'; // 'global' | 'rooms' | 'listings'
$reason = isset($input['reason']) ? trim($input['reason']) : '';
$admin_id = $admin['id'];

if (!$user_id || !$action) {
    json_response(['error' => 'User ID and action are required'], 400);
    exit;
}

try {
    // Get current user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        json_response(['error' => 'User not found'], 404);
        exit;
    }

    // Handle verification actions (ONLY affects verification_status, NOT account status)
    switch ($action) {
        case 'approve_verification':
            if ($scope === 'rooms') {
                $stmt = $pdo->prepare("UPDATE users SET verified_for_rooms = 1, status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
                $stmt->execute([$reason ?: 'Rooms verification approved by admin', $admin_id, $user_id]);
            } elseif ($scope === 'listings') {
                $stmt = $pdo->prepare("UPDATE users SET verified_for_listings = 1, status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
                $stmt->execute([$reason ?: 'Listings verification approved by admin', $admin_id, $user_id]);
            } else {
                // Global approval grants all posting permissions and marks both per-type flags
                $stmt = $pdo->prepare("UPDATE users SET verification_status = 'verified', is_verified = 1, can_post_rooms = 1, can_post_listings = 1, verified_for_rooms = 1, verified_for_listings = 1, status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
                $stmt->execute([$reason ?: 'Verification approved by admin', $admin_id, $user_id]);
            }
            $message = "User verification approved successfully - posting access granted";
            break;

        case 'reject_verification':
            if ($scope === 'rooms') {
                $stmt = $pdo->prepare("UPDATE users SET verified_for_rooms = 0, status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
                $stmt->execute([$reason ?: 'Rooms verification rejected by admin', $admin_id, $user_id]);
            } elseif ($scope === 'listings') {
                $stmt = $pdo->prepare("UPDATE users SET verified_for_listings = 0, status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
                $stmt->execute([$reason ?: 'Listings verification rejected by admin', $admin_id, $user_id]);
            } else {
                $stmt = $pdo->prepare("UPDATE users SET verification_status = 'rejected', is_verified = 0, verified_for_rooms = 0, verified_for_listings = 0, status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
                $stmt->execute([$reason ?: 'Verification rejected by admin', $admin_id, $user_id]);
            }
            $message = "User verification rejected successfully";
            break;

        case 'suspend_verification':
            if ($scope === 'rooms') {
                $stmt = $pdo->prepare("UPDATE users SET verified_for_rooms = 0, status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
                $stmt->execute([$reason ?: 'Rooms verification suspended by admin', $admin_id, $user_id]);
            } elseif ($scope === 'listings') {
                $stmt = $pdo->prepare("UPDATE users SET verified_for_listings = 0, status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
                $stmt->execute([$reason ?: 'Listings verification suspended by admin', $admin_id, $user_id]);
            } else {
                $stmt = $pdo->prepare("UPDATE users SET verification_status = 'suspended', is_verified = 0, verified_for_rooms = 0, verified_for_listings = 0, status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
                $stmt->execute([$reason ?: 'Verification suspended by admin', $admin_id, $user_id]);
            }
            $message = "User verification suspended successfully (posting only)";
            break;

        case 'reset_verification':
            if ($scope === 'rooms') {
                $stmt = $pdo->prepare("UPDATE users SET verified_for_rooms = 0, status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
                $stmt->execute([$reason ?: 'Rooms verification reset by admin', $admin_id, $user_id]);
            } elseif ($scope === 'listings') {
                $stmt = $pdo->prepare("UPDATE users SET verified_for_listings = 0, status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
                $stmt->execute([$reason ?: 'Listings verification reset by admin', $admin_id, $user_id]);
            } else {
                $stmt = $pdo->prepare("UPDATE users SET verification_status = 'unverified', is_verified = 0, verified_for_rooms = 0, verified_for_listings = 0, status_reason = ?, status_changed_at = NOW(), status_changed_by = ? WHERE id = ?");
                $stmt->execute([$reason ?: 'Verification reset by admin', $admin_id, $user_id]);
            }
            $message = "User verification reset - needs to verify again";
            break;

        default:
            json_response(['error' => 'Invalid action'], 400);
            exit;
    }

    // Log the action
    $stmt = $pdo->prepare("
        INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $admin_id,
        "verification_$action",
        json_encode([
            'target_user_id' => $user_id,
            'action' => $action,
            'scope' => $scope,
            'reason' => $reason,
            'admin_email' => $admin['email']
        ]),
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    json_response([
        'success' => true,
        'message' => $message,
        'user_id' => $user_id,
        'action' => $action,
        'scope' => $scope
    ]);

} catch (PDOException $e) {
    error_log('Verification action error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>