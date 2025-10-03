<?php
/**
 * Admin - Get all users with posting access information
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

// Require admin authentication
$admin = require_admin($pdo);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

try {
    // Get filter parameters
    $search = $_GET['search'] ?? '';
    $access_filter = $_GET['access_filter'] ?? 'all'; // all, rooms_blocked, listings_blocked, all_blocked

    // Build query
    $sql = "SELECT
                id,
                email,
                full_name,
                role,
                account_type,
                can_post_rooms,
                can_post_listings,
                posting_suspended_reason,
                posting_suspended_at,
                posting_suspended_by,
                status,
                created_at
            FROM users
            WHERE 1=1";

    $params = [];

    // Apply search filter
    if (!empty($search)) {
        $sql .= " AND (email LIKE ? OR full_name LIKE ?)";
        $searchParam = "%{$search}%";
        $params[] = $searchParam;
        $params[] = $searchParam;
    }

    // Apply access filter
    if ($access_filter === 'rooms_blocked') {
        $sql .= " AND can_post_rooms = 0";
    } elseif ($access_filter === 'listings_blocked') {
        $sql .= " AND can_post_listings = 0";
    } elseif ($access_filter === 'all_blocked') {
        $sql .= " AND (can_post_rooms = 0 OR can_post_listings = 0)";
    }

    $sql .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    json_response([
        'success' => true,
        'users' => $users,
        'count' => count($users)
    ]);

} catch (PDOException $e) {
    error_log("Database error in posting-access-list.php: " . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>