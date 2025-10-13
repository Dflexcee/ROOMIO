<?php
/**
 * Get Room Posters - People who posted rooms
 * Shows unique users who have posted approved rooms
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../lib/UrlHelper.php';
UrlHelper::applyCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';

try {
    // Get unique users who have posted approved rooms with their room info
    $sql = "SELECT DISTINCT
                u.id,
                u.full_name,
                u.email,
                u.phone,
                u.avatar_url,
                u.gender,
                u.religion,
                u.lifestyle,
                u.university,
                u.budget_range,
                u.about_me,
                (SELECT COUNT(*) FROM rooms WHERE user_id = u.id AND status = 'approved') as total_rooms,
                (SELECT GROUP_CONCAT(title SEPARATOR '||') FROM rooms WHERE user_id = u.id AND status = 'approved' LIMIT 3) as room_titles
            FROM users u
            INNER JOIN rooms r ON u.id = r.user_id
            WHERE r.status = 'approved'
            AND u.role != 'admin'
            AND u.role != 'banned'
            ORDER BY u.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $posters = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert room_titles to array and convert avatar URLs
    foreach ($posters as &$poster) {
        if ($poster['room_titles']) {
            $poster['rooms'] = explode('||', $poster['room_titles']);
        } else {
            $poster['rooms'] = [];
        }
        unset($poster['room_titles']);

        // Convert avatar URL to absolute
        if (isset($poster['avatar_url']) && !empty($poster['avatar_url'])) {
            $poster['avatar_url'] = UrlHelper::toAbsoluteUrl($poster['avatar_url']);
        }
    }

    json_response(['posters' => $posters, 'total' => count($posters)]);

} catch (Exception $e) {
    error_log('Room posters fetch error: ' . $e->getMessage());
    json_response(['error' => 'Database error occurred'], 500);
}
?>
