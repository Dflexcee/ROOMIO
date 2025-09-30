<?php
/**
 * User Status Validation Middleware
 *
 * This middleware checks if a user's account status has been changed
 * by an admin (suspended, banned, deactivated) and blocks API access
 * if the user should no longer have access.
 *
 * Usage: Include this file in protected API endpoints
 * require_once __DIR__ . '/../middleware/check-user-status.php';
 */

function checkUserStatus($pdo, $user_id, $exclude_admin = true) {
    if (!$user_id) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Unauthorized: No user session found',
            'status_code' => 'NO_SESSION'
        ]);
        exit;
    }

    try {
        // Get current user status from database
        $stmt = $pdo->prepare('
            SELECT
                id, email, role, status, verification_status,
                status_reason, status_changed_at, status_changed_by
            FROM users
            WHERE id = ?
        ');
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'User not found',
                'status_code' => 'USER_NOT_FOUND'
            ]);
            exit;
        }

        // Admins and managers bypass status checks (optional)
        if ($exclude_admin && in_array($user['role'], ['admin', 'manager'])) {
            return $user; // Allow access
        }

        // Check if user is banned
        if ($user['status'] === 'banned') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'Your account has been banned',
                'status_code' => 'ACCOUNT_BANNED',
                'status' => 'banned',
                'reason' => $user['status_reason'] ?? 'No reason provided',
                'changed_at' => $user['status_changed_at']
            ]);
            exit;
        }

        // Check if user is suspended
        if ($user['status'] === 'suspended') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'Your account has been suspended',
                'status_code' => 'ACCOUNT_SUSPENDED',
                'status' => 'suspended',
                'reason' => $user['status_reason'] ?? 'No reason provided',
                'changed_at' => $user['status_changed_at']
            ]);
            exit;
        }

        // Check if user is deactivated/inactive
        if ($user['status'] === 'inactive') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'Your account has been deactivated',
                'status_code' => 'ACCOUNT_INACTIVE',
                'status' => 'inactive',
                'reason' => $user['status_reason'] ?? 'No reason provided',
                'changed_at' => $user['status_changed_at']
            ]);
            exit;
        }

        // Check verification status for suspended verification
        if ($user['verification_status'] === 'suspended') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'Your verification has been suspended',
                'status_code' => 'VERIFICATION_SUSPENDED',
                'verification_status' => 'suspended',
                'reason' => $user['status_reason'] ?? 'No reason provided',
                'changed_at' => $user['status_changed_at']
            ]);
            exit;
        }

        // User status is valid, return user data
        return $user;

    } catch (PDOException $e) {
        error_log('User status check error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database error while checking user status',
            'status_code' => 'DATABASE_ERROR'
        ]);
        exit;
    }
}

/**
 * Quick status check - just returns true/false
 * Useful for conditional logic without exiting
 */
function isUserStatusValid($pdo, $user_id, $exclude_admin = true) {
    try {
        $stmt = $pdo->prepare('
            SELECT id, role, status, verification_status
            FROM users
            WHERE id = ?
        ');
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return false;
        }

        // Admins bypass checks
        if ($exclude_admin && in_array($user['role'], ['admin', 'manager'])) {
            return true;
        }

        // Check status
        if (in_array($user['status'], ['banned', 'suspended', 'inactive'])) {
            return false;
        }

        // Check verification status
        if ($user['verification_status'] === 'suspended') {
            return false;
        }

        return true;

    } catch (PDOException $e) {
        error_log('User status validation error: ' . $e->getMessage());
        return false;
    }
}
?>