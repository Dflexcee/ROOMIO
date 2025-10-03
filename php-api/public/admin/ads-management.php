<?php
/**
 * Admin Ads Management API - Complete CRUD for popup ads
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

$admin = require_admin($pdo);

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get all ads with statistics
            $stmt = $pdo->query("
                SELECT
                    a.*,
                    u.email as created_by_email,
                    (SELECT COUNT(*) FROM ad_views WHERE ad_id = a.id) as total_views,
                    (SELECT COUNT(*) FROM ad_clicks WHERE ad_id = a.id) as total_clicks
                FROM ads a
                LEFT JOIN users u ON a.created_by = u.id
                ORDER BY a.priority DESC, a.created_at DESC
            ");

            $ads = $stmt->fetchAll(PDO::FETCH_ASSOC);

            json_response([
                'success' => true,
                'ads' => $ads
            ]);
            break;

        case 'POST':
            // Create new ad
            $input = json_decode(file_get_contents('php://input'), true);

            $title = $input['title'] ?? '';
            $description = $input['description'] ?? '';
            $image_url = $input['image_url'] ?? '';
            $target_link = $input['target_link'] ?? '';
            $ad_type = $input['ad_type'] ?? 'popup';
            $display_frequency = $input['display_frequency'] ?? 'once_per_session';
            $target_audience = $input['target_audience'] ?? 'all';
            $active = isset($input['active']) ? (int)$input['active'] : 1;
            $priority = (int)($input['priority'] ?? 0);

            if (empty($title) || empty($image_url)) {
                json_response(['error' => 'Title and image are required'], 400);
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
                $display_frequency, $target_audience, $active, $priority, $admin['id']
            ]);

            $adId = $pdo->lastInsertId();

            // Log action
            $logStmt = $pdo->prepare("
                INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
                VALUES (?, 'ad_created', ?, ?, NOW())
            ");
            $logStmt->execute([
                $admin['id'],
                json_encode(['ad_id' => $adId, 'title' => $title]),
                $_SERVER['REMOTE_ADDR'] ?? null
            ]);

            json_response([
                'success' => true,
                'message' => 'Ad created successfully',
                'ad_id' => $adId
            ]);
            break;

        case 'PUT':
            // Update ad
            $input = json_decode(file_get_contents('php://input'), true);
            $ad_id = (int)($input['id'] ?? 0);

            if (!$ad_id) {
                json_response(['error' => 'Ad ID required'], 400);
                exit;
            }

            $updates = [];
            $params = [];

            if (isset($input['title'])) {
                $updates[] = "title = ?";
                $params[] = $input['title'];
            }
            if (isset($input['description'])) {
                $updates[] = "description = ?";
                $params[] = $input['description'];
            }
            if (isset($input['image_url'])) {
                $updates[] = "image_url = ?";
                $params[] = $input['image_url'];
            }
            if (isset($input['target_link'])) {
                $updates[] = "target_link = ?";
                $params[] = $input['target_link'];
            }
            if (isset($input['ad_type'])) {
                $updates[] = "ad_type = ?";
                $params[] = $input['ad_type'];
            }
            if (isset($input['display_frequency'])) {
                $updates[] = "display_frequency = ?";
                $params[] = $input['display_frequency'];
            }
            if (isset($input['target_audience'])) {
                $updates[] = "target_audience = ?";
                $params[] = $input['target_audience'];
            }
            if (isset($input['active'])) {
                $updates[] = "active = ?";
                $params[] = (int)$input['active'];
            }
            if (isset($input['priority'])) {
                $updates[] = "priority = ?";
                $params[] = (int)$input['priority'];
            }

            if (empty($updates)) {
                json_response(['error' => 'No fields to update'], 400);
                exit;
            }

            $params[] = $ad_id;
            $sql = "UPDATE ads SET " . implode(", ", $updates) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            // Log action
            $logStmt = $pdo->prepare("
                INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
                VALUES (?, 'ad_updated', ?, ?, NOW())
            ");
            $logStmt->execute([
                $admin['id'],
                json_encode(['ad_id' => $ad_id, 'updates' => array_keys($input)]),
                $_SERVER['REMOTE_ADDR'] ?? null
            ]);

            json_response([
                'success' => true,
                'message' => 'Ad updated successfully'
            ]);
            break;

        case 'DELETE':
            // Delete ad
            $input = json_decode(file_get_contents('php://input'), true);
            $ad_id = (int)($input['id'] ?? 0);

            if (!$ad_id) {
                json_response(['error' => 'Ad ID required'], 400);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM ads WHERE id = ?");
            $stmt->execute([$ad_id]);

            // Log action
            $logStmt = $pdo->prepare("
                INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
                VALUES (?, 'ad_deleted', ?, ?, NOW())
            ");
            $logStmt->execute([
                $admin['id'],
                json_encode(['ad_id' => $ad_id]),
                $_SERVER['REMOTE_ADDR'] ?? null
            ]);

            json_response([
                'success' => true,
                'message' => 'Ad deleted successfully'
            ]);
            break;

        default:
            json_response(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    error_log("Database error in ads-management.php: " . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>