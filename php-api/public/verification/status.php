<?php
require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

// Get authenticated user
$user = require_auth($pdo);

if (!$user || !isset($user['id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $user_id = $user['id'];

        // Get user's verification status from users table
        $stmt = $pdo->prepare("
            SELECT
                verification_status,
                status_reason,
                can_post_rooms,
                can_post_listings,
                verified_for_rooms,
                verified_for_listings,
                role
            FROM users
            WHERE id = ?
        ");
        $stmt->execute([$user_id]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$userData) {
            json_response(['error' => 'User not found'], 404);
            exit;
        }

        // Admins bypass verification - always verified
        if ($userData['role'] === 'admin' || $userData['role'] === 'manager') {
            json_response([
                'success' => true,
                'status' => 'verified',
                'message' => 'Admin access - no verification required',
                'can_post_rooms' => true,
                'can_post_listings' => true,
                'verification_request' => null
            ]);
            exit;
        }

        // Get most recent verification request if exists
        $stmt = $pdo->prepare("
            SELECT
                id,
                status,
                reviewed_at,
                created_at
            FROM verification_requests
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 1
        ");
        $stmt->execute([$user_id]);
        $verificationRequest = $stmt->fetch(PDO::FETCH_ASSOC);

        // Determine the current status
        $status = $userData['verification_status'] ?: 'unverified';
        $message = $userData['status_reason'] ?: '';

        json_response([
            'success' => true,
            'status' => $status,
            'message' => $message,
            'can_post_rooms' => (bool)$userData['can_post_rooms'],
            'can_post_listings' => (bool)$userData['can_post_listings'],
            'verification_request' => $verificationRequest,
            'verified_for_rooms' => (bool)($userData['verified_for_rooms'] ?? 0),
            'verified_for_listings' => (bool)($userData['verified_for_listings'] ?? 0)
        ]);

    } catch (PDOException $e) {
        error_log("Verification Status Error: " . $e->getMessage());
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    } catch (Exception $e) {
        error_log("Verification Status Error: " . $e->getMessage());
        json_response(['error' => $e->getMessage()], 500);
    }
} else {
    json_response(['error' => 'Method not allowed'], 405);
}
?>
