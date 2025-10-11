<?php
/**
 * Get ads for display on user-facing pages
 * Returns ads based on type, frequency, and targeting
 * NOW WITH SMART AD ROTATION FOR MULTIPLE ADS
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';
require_once '../../lib/UrlHelper.php';

// Handle CORS
UrlHelper::applyCorsHeaders();

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

// Get current user (optional)
$user = null;
$user_email = null;
$user_name = null;
if (isset($_SESSION['user_id'])) {
    try {
        $stmt = $pdo->prepare("SELECT id, account_type, email, full_name FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            $user_email = $user['email'];
            $user_name = $user['full_name'];
        }
    } catch (Exception $e) {
        // Not logged in, that's fine
    }
}

$session_id = session_id();
$ad_type = $_GET['type'] ?? 'all'; // banner, popup, sidebar, all
$limit = (int)($_GET['limit'] ?? 1); // How many ads to return

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

    // Get all eligible ads, ordered by priority
    $stmt = $pdo->prepare("
        SELECT * FROM ads
        WHERE {$targetQuery}
        ORDER BY priority DESC, RAND()
        LIMIT 100
    ");
    $stmt->execute($params);
    $eligibleAds = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($eligibleAds)) {
        json_response(['success' => true, 'ads' => []]);
        exit;
    }

    // Filter by display frequency and select ads
    $selectedAds = [];
    $adsToReturn = min($limit, count($eligibleAds));

    foreach ($eligibleAds as $ad) {
        if (count($selectedAds) >= $adsToReturn) {
            break;
        }

        $shouldShow = false;

        switch ($ad['display_frequency']) {
            case 'always':
                $shouldShow = true;
                break;

            case 'once_per_session':
                // Check if user/session has seen this ad in this session (last 4 hours)
                $checkStmt = $pdo->prepare("
                    SELECT COUNT(*) as count FROM ad_impressions
                    WHERE ad_id = ? AND viewed_at > DATE_SUB(NOW(), INTERVAL 4 HOUR)
                    " . ($user ? "AND user_id = ?" : "")
                );
                if ($user) {
                    $checkStmt->execute([$ad['id'], $user['id']]);
                } else {
                    $checkStmt->execute([$ad['id']]);
                }
                $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
                $shouldShow = ($result['count'] == 0);
                break;

            case 'once_per_day':
                // Check if user/session has seen this ad today
                $checkStmt = $pdo->prepare("
                    SELECT COUNT(*) as count FROM ad_impressions
                    WHERE ad_id = ? AND DATE(viewed_at) = CURDATE()
                    " . ($user ? "AND user_id = ?" : "")
                );
                if ($user) {
                    $checkStmt->execute([$ad['id'], $user['id']]);
                } else {
                    $checkStmt->execute([$ad['id']]);
                }
                $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
                $shouldShow = ($result['count'] == 0);
                break;
        }

        if ($shouldShow) {
            // Record impression with detailed tracking
            $viewStmt = $pdo->prepare("
                INSERT INTO ad_impressions (ad_id, user_id, user_email, user_name, page_url, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $viewStmt->execute([
                $ad['id'],
                $user ? $user['id'] : null,
                $user_email,
                $user_name,
                $_SERVER['HTTP_REFERER'] ?? null,
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
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
        'ads' => $selectedAds,
        'total_available' => count($eligibleAds),
        'rotation_info' => [
            'ads_returned' => count($selectedAds),
            'ads_requested' => $limit,
            'has_more' => count($eligibleAds) > count($selectedAds)
        ]
    ]);

} catch (PDOException $e) {
    error_log("Database error in get-ads.php: " . $e->getMessage());
    json_response(['error' => 'Database error'], 500);
}
?>
