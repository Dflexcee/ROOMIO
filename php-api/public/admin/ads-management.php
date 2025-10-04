<?php
/**
 * Admin Ads Management API - Simple and Robust
 */

require_once '../../config.php';
require_once '../../bootstrap.php';

// Authentication check
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

// Check if user is admin
$stmt = $pdo->prepare('SELECT role FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$userRole = $stmt->fetchColumn();

if ($userRole !== 'admin') {
    json_response(['error' => 'Admin access required'], 403);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Fetch all ads
        $stmt = $pdo->query("
            SELECT
                a.*,
                u.email as created_by_email
            FROM ads a
            LEFT JOIN users u ON a.created_by = u.id
            ORDER BY a.priority DESC, a.created_at DESC
        ");

        $ads = $stmt->fetchAll(PDO::FETCH_ASSOC);

        json_response([
            'success' => true,
            'ads' => $ads
        ]);

    } elseif ($method === 'POST') {
        // Create new ad
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            json_response(['error' => 'Invalid JSON input'], 400);
            exit;
        }

        $title = trim($input['title'] ?? '');
        $description = trim($input['description'] ?? '');
        $image_url = trim($input['image_url'] ?? '');
        $target_link = trim($input['target_link'] ?? '');
        $ad_type = $input['ad_type'] ?? 'popup';
        $display_frequency = $input['display_frequency'] ?? 'once_per_session';
        $target_audience = $input['target_audience'] ?? 'all';
        $active = isset($input['active']) ? (int)$input['active'] : 1;
        $priority = (int)($input['priority'] ?? 0);

        if (empty($title)) {
            json_response(['error' => 'Title is required'], 400);
            exit;
        }

        if (empty($image_url)) {
            json_response(['error' => 'Image URL is required'], 400);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO ads (
                title, description, image_url, target_link, ad_type,
                display_frequency, target_audience, active, priority, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $title, $description, $image_url, $target_link, $ad_type,
            $display_frequency, $target_audience, $active, $priority, $_SESSION['user_id']
        ]);

        $adId = $pdo->lastInsertId();

        json_response([
            'success' => true,
            'message' => 'Ad created successfully',
            'ad_id' => $adId
        ]);

    } elseif ($method === 'PUT') {
        // Update ad
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            json_response(['error' => 'Invalid JSON input'], 400);
            exit;
        }

        $ad_id = (int)($input['id'] ?? 0);

        if (!$ad_id) {
            json_response(['error' => 'Ad ID is required'], 400);
            exit;
        }

        $updates = [];
        $params = [];

        $allowedFields = ['title', 'description', 'image_url', 'target_link', 'ad_type',
                         'display_frequency', 'target_audience', 'active', 'priority'];

        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updates[] = "$field = ?";
                $params[] = $input[$field];
            }
        }

        if (empty($updates)) {
            json_response(['error' => 'No fields to update'], 400);
            exit;
        }

        $params[] = $ad_id;
        $sql = "UPDATE ads SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        json_response([
            'success' => true,
            'message' => 'Ad updated successfully'
        ]);

    } elseif ($method === 'DELETE') {
        // Delete ad
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input) {
            json_response(['error' => 'Invalid JSON input'], 400);
            exit;
        }

        $ad_id = (int)($input['id'] ?? 0);

        if (!$ad_id) {
            json_response(['error' => 'Ad ID is required'], 400);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM ads WHERE id = ?");
        $stmt->execute([$ad_id]);

        json_response([
            'success' => true,
            'message' => 'Ad deleted successfully'
        ]);

    } else {
        json_response(['error' => 'Method not allowed'], 405);
    }

} catch (PDOException $e) {
    error_log("Ads Management Error: " . $e->getMessage());
    json_response([
        'error' => 'Database error',
        'details' => $e->getMessage()
    ], 500);
} catch (Exception $e) {
    error_log("Ads Management Error: " . $e->getMessage());
    json_response([
        'error' => 'Server error',
        'details' => $e->getMessage()
    ], 500);
}
?>
