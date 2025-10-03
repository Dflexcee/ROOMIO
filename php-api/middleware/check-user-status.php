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
        json_response([
            'success' => false,
            'error' => 'Unauthorized: No user session found',
            'status_code' => 'NO_SESSION'
        ], 401);
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
            json_response([
                'success' => false,
                'error' => 'User not found',
                'status_code' => 'USER_NOT_FOUND'
            ], 404);
            exit;
        }

        // Admins and managers bypass status checks (optional)
        if ($exclude_admin && in_array($user['role'], ['admin', 'manager'])) {
            return $user; // Allow access
        }

        // Check if user is banned
        if ($user['status'] === 'banned') {
            json_response([
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
            json_response([
                'success' => false,
                'error' => 'Your account has been suspended',
                'status_code' => 'ACCOUNT_SUSPENDED',
                'status' => 'suspended',
                'reason' => $user['status_reason'] ?? 'No reason provided',
                'changed_at' => $user['status_changed_at']
            ], 403);
            exit;
        }

        // Check if user is deactivated/inactive
        if ($user['status'] === 'inactive') {
            json_response([
                'success' => false,
                'error' => 'Your account has been deactivated',
                'status_code' => 'ACCOUNT_INACTIVE',
                'status' => 'inactive',
                'reason' => $user['status_reason'] ?? 'No reason provided',
                'changed_at' => $user['status_changed_at']
            ], 403);
            exit;
        }

        // NOTE: We do NOT check verification_status here
        // Verification status only affects posting ability (checked in /rooms/create endpoint)
        // Users with suspended/rejected verification can still browse, message, edit profile, etc.

        // User status is valid, return user data
        return $user;

    } catch (PDOException $e) {
        error_log('User status check error: ' . $e->getMessage());
        json_response([
            'success' => false,
            'error' => 'Database error while checking user status',
            'status_code' => 'DATABASE_ERROR'
        ], 500);
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

        // Check status (only account-level status, NOT verification)
        if (in_array($user['status'], ['banned', 'suspended', 'inactive'])) {
            return false;
        }

        // NOTE: We do NOT check verification_status here
        // Verification only affects posting, not general API access

        return true;

    } catch (PDOException $e) {
        error_log('User status validation error: ' . $e->getMessage());
        return false;
    }
}
?>