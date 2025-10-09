<?php
/**
 * Ad Analytics API - Detailed analytics for ad performance
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

$ad_id = (int)($_GET['ad_id'] ?? 0);

if (!$ad_id) {
    json_response(['error' => 'Ad ID required'], 400);
    exit;
}

try {
    // Get ad details
    $stmt = $pdo->prepare("SELECT * FROM ads WHERE id = ?");
    $stmt->execute([$ad_id]);
    $ad = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ad) {
        json_response(['error' => 'Ad not found'], 404);
        exit;
    }

    // Get click analytics with user breakdown
    $clickStmt = $pdo->query("
        SELECT
            user_id,
            user_email,
            user_name,
            COUNT(*) as click_count,
            MIN(clicked_at) as first_click,
            MAX(clicked_at) as last_click
        FROM ad_clicks
        WHERE ad_id = {$ad_id}
        GROUP BY user_id, user_email, user_name
        ORDER BY click_count DESC, last_click DESC
    ");
    $clicksByUser = $clickStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get impression analytics with user breakdown
    $impressionStmt = $pdo->query("
        SELECT
            user_id,
            user_email,
            user_name,
            COUNT(*) as impression_count,
            MIN(viewed_at) as first_view,
            MAX(viewed_at) as last_view
        FROM ad_impressions
        WHERE ad_id = {$ad_id}
        GROUP BY user_id, user_email, user_name
        ORDER BY impression_count DESC, last_view DESC
    ");
    $impressionsByUser = $impressionStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get hourly breakdown for last 24 hours
    $hourlyStmt = $pdo->query("
        SELECT
            DATE_FORMAT(clicked_at, '%Y-%m-%d %H:00:00') as hour,
            COUNT(*) as clicks
        FROM ad_clicks
        WHERE ad_id = {$ad_id}
        AND clicked_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY hour
        ORDER BY hour
    ");
    $hourlyClicks = $hourlyStmt->fetchAll(PDO::FETCH_ASSOC);

    $hourlyImpressionStmt = $pdo->query("
        SELECT
            DATE_FORMAT(viewed_at, '%Y-%m-%d %H:00:00') as hour,
            COUNT(*) as impressions
        FROM ad_impressions
        WHERE ad_id = {$ad_id}
        AND viewed_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY hour
        ORDER BY hour
    ");
    $hourlyImpressions = $hourlyImpressionStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get daily breakdown for last 30 days
    $dailyStmt = $pdo->query("
        SELECT
            DATE(clicked_at) as date,
            COUNT(*) as clicks
        FROM ad_clicks
        WHERE ad_id = {$ad_id}
        AND clicked_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY date
        ORDER BY date
    ");
    $dailyClicks = $dailyStmt->fetchAll(PDO::FETCH_ASSOC);

    $dailyImpressionStmt = $pdo->query("
        SELECT
            DATE(viewed_at) as date,
            COUNT(*) as impressions
        FROM ad_impressions
        WHERE ad_id = {$ad_id}
        AND viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY date
        ORDER BY date
    ");
    $dailyImpressions = $dailyImpressionStmt->fetchAll(PDO::FETCH_ASSOC);

    // Get top performing times (hour of day)
    $topHoursStmt = $pdo->query("
        SELECT
            HOUR(clicked_at) as hour,
            COUNT(*) as clicks
        FROM ad_clicks
        WHERE ad_id = {$ad_id}
        GROUP BY hour
        ORDER BY clicks DESC
        LIMIT 5
    ");
    $topHours = $topHoursStmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate CTR
    $totalImpressions = (int)$ad['impressions'];
    $totalClicks = (int)$ad['clicks'];
    $ctr = $totalImpressions > 0 ? ($totalClicks / $totalImpressions) * 100 : 0;

    // Get unique users
    $uniqueClickersStmt = $pdo->query("
        SELECT COUNT(DISTINCT user_id) as count
        FROM ad_clicks
        WHERE ad_id = {$ad_id} AND user_id IS NOT NULL
    ");
    $uniqueClickers = $uniqueClickersStmt->fetchColumn();

    $uniqueViewersStmt = $pdo->query("
        SELECT COUNT(DISTINCT user_id) as count
        FROM ad_impressions
        WHERE ad_id = {$ad_id} AND user_id IS NOT NULL
    ");
    $uniqueViewers = $uniqueViewersStmt->fetchColumn();

    // Get conversion data (if any)
    $conversionStmt = $pdo->query("
        SELECT
            conversion_type,
            COUNT(*) as count,
            SUM(revenue) as total_revenue
        FROM ad_conversions
        WHERE ad_id = {$ad_id}
        GROUP BY conversion_type
    ");
    $conversions = $conversionStmt->fetchAll(PDO::FETCH_ASSOC);

    json_response([
        'success' => true,
        'ad' => $ad,
        'summary' => [
            'total_impressions' => $totalImpressions,
            'total_clicks' => $totalClicks,
            'ctr' => round($ctr, 2),
            'unique_clickers' => $uniqueClickers,
            'unique_viewers' => $uniqueViewers
        ],
        'clicks_by_user' => $clicksByUser,
        'impressions_by_user' => $impressionsByUser,
        'hourly_clicks' => $hourlyClicks,
        'hourly_impressions' => $hourlyImpressions,
        'daily_clicks' => $dailyClicks,
        'daily_impressions' => $dailyImpressions,
        'top_hours' => $topHours,
        'conversions' => $conversions
    ]);

} catch (PDOException $e) {
    error_log("Ad Analytics Error: " . $e->getMessage());
    json_response([
        'error' => 'Database error',
        'details' => $e->getMessage()
    ], 500);
}
?>
