<?php
/**
 * Get popup ad for user dashboard
 * Respects display frequency and targeting
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

header('Content-Type: application/json');

// Get current user (optional - ads can show to guests too)
$user = null;
if (isset($_SESSION['user_id'])) {
    try {
        $stmt = $pdo->prepare("SELECT id, account_type FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        // Not logged in, that's fine
    }
}

$session_id = session_id();

try {
    // Build targeting query
    $targetQuery = "active = 1 AND ad_type = 'popup'";
    $params = [];

    // Target by user type if logged in
    if ($user) {
        $targetQuery .= " AND (target_audience = 'all' OR target_audience = ?)";
        $params[] = $user['account_type'];
    } else {
        $targetQuery .= " AND target_audience = 'all'";
    }

    // Get all eligible ads
    $stmt = $pdo->prepare("
        SELECT * FROM ads
        WHERE {$targetQuery}
        ORDER BY priority DESC, RAND()
        LIMIT 10
    ");
    $stmt->execute($params);
    $eligibleAds = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($eligibleAds)) {
        json_response(['success' => true, 'ad' => null]);
        exit;
    }

    // Filter by display frequency
    $selectedAd = null;
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
            $selectedAd = $ad;
            break;
        }
    }

    if (!$selectedAd) {
        json_response(['success' => true, 'ad' => null]);
        exit;
    }

    // Record view
    $viewStmt = $pdo->prepare("
        INSERT INTO ad_views (ad_id, user_id, session_id)
        VALUES (?, ?, ?)
    ");
    $viewStmt->execute([
        $selectedAd['id'],
        $user ? $user['id'] : null,
        $session_id
    ]);

    // Increment impressions count
    $pdo->prepare("UPDATE ads SET impressions = impressions + 1 WHERE id = ?")->execute([$selectedAd['id']]);

    json_response([
        'success' => true,
        'ad' => [
            'id' => $selectedAd['id'],
            'title' => $selectedAd['title'],
            'description' => $selectedAd['description'],
            'image_url' => $selectedAd['image_url'],
            'target_link' => $selectedAd['target_link'],
            'display_duration' => $selectedAd['display_duration'] ?? 5,
            'skip_after_seconds' => $selectedAd['skip_after_seconds'] ?? 3,
            'display_interval_hours' => $selectedAd['display_interval_hours'] ?? 24
        ]
    ]);

} catch (PDOException $e) {
    error_log("Database error in get-popup.php: " . $e->getMessage());
    json_response(['error' => 'Database error'], 500);
}
?>