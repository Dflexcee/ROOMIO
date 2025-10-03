<?php
/**
 * Admin Listings Management
 * GET - List all listings
 * PUT - Update listing status (approve/reject/suspend)
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

// Require admin authentication
$admin = require_admin($pdo);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get all listings with user information
        $stmt = $pdo->prepare("
            SELECT
                l.*,
                u.full_name as owner_name,
                u.email as owner_email,
                u.avatar_url as owner_avatar
            FROM listings l
            LEFT JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
        ");
        $stmt->execute();
        $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Parse JSON fields
        foreach ($listings as &$listing) {
            if (isset($listing['images']) && is_string($listing['images'])) {
                $listing['images'] = json_decode($listing['images'], true) ?: [];
            }
            if (isset($listing['specifications']) && is_string($listing['specifications'])) {
                $listing['specifications'] = json_decode($listing['specifications'], true) ?: [];
            }
        }

        json_response([
            'success' => true,
            'listings' => $listings,
            'total' => count($listings)
        ]);

    } catch (PDOException $e) {
        error_log('Admin listings fetch error: ' . $e->getMessage());
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $listing_id = (int)($input['listing_id'] ?? 0);
    $action = $input['action'] ?? '';
    $reason = isset($input['reason']) ? trim($input['reason']) : '';

    if (!$listing_id || !$action) {
        json_response(['error' => 'Listing ID and action are required'], 400);
        exit;
    }

    try {
        // Get current listing
        $stmt = $pdo->prepare("SELECT * FROM listings WHERE id = ?");
        $stmt->execute([$listing_id]);
        $listing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$listing) {
            json_response(['error' => 'Listing not found'], 404);
            exit;
        }

        $newStatus = '';
        $message = '';

        switch ($action) {
            case 'approve':
                $newStatus = 'approved';
                $message = 'Listing approved successfully';
                break;

            case 'reject':
                $newStatus = 'rejected';
                $message = 'Listing rejected';
                break;

            case 'suspend':
                $newStatus = 'suspended';
                $message = 'Listing suspended';
                break;

            case 'pending':
                $newStatus = 'pending';
                $message = 'Listing set to pending';
                break;

            default:
                json_response(['error' => 'Invalid action'], 400);
                exit;
        }

        // Update listing status
        $stmt = $pdo->prepare("
            UPDATE listings
            SET status = ?,
                status_reason = ?,
                status_changed_by = ?,
                status_changed_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$newStatus, $reason, $admin['id'], $listing_id]);

        // Log the action
        $stmt = $pdo->prepare("
            INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $admin['id'],
            "listing_$action",
            json_encode([
                'listing_id' => $listing_id,
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
            'listing_id' => $listing_id,
            'new_status' => $newStatus
        ]);

    } catch (PDOException $e) {
        error_log('Listing status update error: ' . $e->getMessage());
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

else {
    json_response(['error' => 'Method not allowed'], 405);
}
?>