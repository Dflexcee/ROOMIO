<?php
/**
 * Get ads for display on user-facing pages
 * Returns ads based on type, frequency, and targeting
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

header('Content-Type: application/json');

// Get current user (optional)
$user = null;
try {
    $user = get_current_user($pdo);
} catch (Exception $e) {
    // Not logged in, that's fine
}

$session_id = session_id();
$ad_type = $_GET['type'] ?? 'all'; // banner, popup, all

try {
    // Build targeting query
    $targetQuery = "active = 1";
    $params = [];

    // Filter by ad type if specified
    if ($ad_type !== 'all') {
        $targetQuery .= " AND ad_type = ?";
        $params[] = $ad_type;
    }

    // Target by user type if logged in
    if ($user) {
        $targetQuery .= " AND (target_audience = 'all' OR target_audience = ?)";
        $params[] = $user['account_type'] ?? 'individual';
    } else {
        $targetQuery .= " AND target_audience = 'all'";
    }

    // Get all eligible ads
    $stmt = $pdo->prepare("
        SELECT * FROM ads
        WHERE {$targetQuery}
        ORDER BY priority DESC, RAND()
    ");
    $stmt->execute($params);
    $eligibleAds = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($eligibleAds)) {
        json_response(['success' => true, 'ads' => []]);
        exit;
    }

    // Filter by display frequency
    $selectedAds = [];
    foreach ($eligibleAds as $ad) {
        $shouldShow = false;

        switch ($ad['display_frequency']) {
            case 'always':
                $shouldShow = true;
                break;

            case 'once_per_session':
                // Check if user/session has seen this ad in this session
                $checkStmt = $pdo->prepare("
                    SELECT COUNT(*) as count FROM ad_views
                    WHERE ad_id = ? AND (session_id = ?" . ($user ? " OR user_id = ?" : "") . ")
                    AND viewed_at > DATE_SUB(NOW(), INTERVAL 4 HOUR)
                ");
                if ($user) {
                    $checkStmt->execute([$ad['id'], $session_id, $user['id']]);
                } else {
                    $checkStmt->execute([$ad['id'], $session_id]);
                }
                $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
                $shouldShow = ($result['count'] == 0);
                break;

            case 'once_per_day':
                // Check if user/session has seen this ad today
                $checkStmt = $pdo->prepare("
                    SELECT COUNT(*) as count FROM ad_views
                    WHERE ad_id = ? AND (session_id = ?" . ($user ? " OR user_id = ?" : "") . ")
                    AND DATE(viewed_at) = CURDATE()
                ");
                if ($user) {
                    $checkStmt->execute([$ad['id'], $session_id, $user['id']]);
                } else {
                    $checkStmt->execute([$ad['id'], $session_id]);
                }
                $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
                $shouldShow = ($result['count'] == 0);
                break;
        }

        if ($shouldShow) {
            // Record view
            $viewStmt = $pdo->prepare("
                INSERT INTO ad_views (ad_id, user_id, session_id)
                VALUES (?, ?, ?)
            ");
            $viewStmt->execute([
                $ad['id'],
                $user ? $user['id'] : null,
                $session_id
            ]);

            // Increment impressions count
            $pdo->prepare("UPDATE ads SET impressions = impressions + 1 WHERE id = ?")->execute([$ad['id']]);

            $selectedAds[] = [
                'id' => $ad['id'],
                'title' => $ad['title'],
                'description' => $ad['description'],
                'image_url' => $ad['image_url'],
                'target_link' => $ad['target_link'],
                'ad_type' => $ad['ad_type'],
                'display_duration' => $ad['display_duration'] ?? 5,
                'skip_after_seconds' => $ad['skip_after_seconds'] ?? 3,
                'display_interval_hours' => $ad['display_interval_hours'] ?? 24
            ];
        }
    }

    json_response([
        'success' => true,
        'ads' => $selectedAds
    ]);

} catch (PDOException $e) {
    error_log("Database error in get-ads.php: " . $e->getMessage());
    json_response(['error' => 'Database error'], 500);
}
?>
