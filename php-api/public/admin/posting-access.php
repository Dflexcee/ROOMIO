<?php
/**
 * Admin Posting Access Management
 * Manage user permissions for posting rooms and listings
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

$admin = require_admin($pdo);
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Get all users with their posting access status
        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? '';

        $sql = "SELECT
                    id, full_name, email, phone, avatar_url,
                    can_post_rooms, can_post_listings,
                    posting_suspended_reason, posting_suspended_at, posting_suspended_by,
                    created_at, status
                FROM users
                WHERE 1=1";

        $params = [];

        if (!empty($search)) {
            $sql .= " AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)";
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        if (!empty($status)) {
            if ($status === 'restricted') {
                $sql .= " AND (can_post_rooms = 0 OR can_post_listings = 0)";
            } elseif ($status === 'allowed') {
                $sql .= " AND can_post_rooms = 1 AND can_post_listings = 1";
            }
        }

        $sql .= " ORDER BY created_at DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        json_response([
            'success' => true,
            'users' => $users,
            'total' => count($users)
        ]);

    } elseif ($method === 'POST' || $method === 'PUT') {
        // Update posting access for a user
        $input = json_decode(file_get_contents('php://input'), true);

        $userId = $input['user_id'] ?? null;
        $canPostRooms = isset($input['can_post_rooms']) ? (int)$input['can_post_rooms'] : null;
        $canPostListings = isset($input['can_post_listings']) ? (int)$input['can_post_listings'] : null;
        $reason = $input['reason'] ?? null;
        $action = $input['action'] ?? 'update'; // 'grant', 'restrict', 'update'

        if (!$userId) {
            json_response(['error' => 'User ID is required'], 400);
            exit;
        }

        // Get current user data
        $stmt = $pdo->prepare("SELECT full_name, email, can_post_rooms, can_post_listings FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            json_response(['error' => 'User not found'], 404);
            exit;
        }

        // Prepare update data
        $updates = [];
        $params = [];

        if ($canPostRooms !== null) {
            $updates[] = "can_post_rooms = ?";
            $params[] = $canPostRooms;
        }

        if ($canPostListings !== null) {
            $updates[] = "can_post_listings = ?";
            $params[] = $canPostListings;
        }

        // If restricting access, require a reason
        if (($canPostRooms === 0 || $canPostListings === 0) && !empty($reason)) {
            $updates[] = "posting_suspended_reason = ?";
            $params[] = $reason;
            $updates[] = "posting_suspended_at = NOW()";
            $updates[] = "posting_suspended_by = ?";
            $params[] = $admin['id'];
        } elseif ($canPostRooms === 1 && $canPostListings === 1) {
            // If granting full access, clear restriction info
            $updates[] = "posting_suspended_reason = NULL";
            $updates[] = "posting_suspended_at = NULL";
            $updates[] = "posting_suspended_by = NULL";
        }

        if (empty($updates)) {
            json_response(['error' => 'No changes to make'], 400);
            exit;
        }

        $params[] = $userId;
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // Log action
        $logStmt = $pdo->prepare("
            INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
            VALUES (?, 'posting_access_updated', ?, ?, NOW())
        ");
        $logStmt->execute([
            $admin['id'],
            json_encode([
                'target_user_id' => $userId,
                'target_user_name' => $user['full_name'],
                'target_user_email' => $user['email'],
                'can_post_rooms' => $canPostRooms,
                'can_post_listings' => $canPostListings,
                'reason' => $reason,
                'action' => $action
            ]),
            $_SERVER['REMOTE_ADDR'] ?? null
        ]);

        json_response([
            'success' => true,
            'message' => 'Posting access updated successfully'
        ]);

    } else {
        json_response(['error' => 'Method not allowed'], 405);
    }

} catch (PDOException $e) {
    error_log('Posting access management error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
