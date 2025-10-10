<?php
/**
 * List All Ads for Admin
 * Returns all ads with full details for rotation management
 */

require_once '../../../config.php';
require_once '../../../bootstrap.php';
require_once '../../../lib/Auth.php';

// Handle CORS
$allowed_origins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
}

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Unauthorized'], 401);
    exit;
}

$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || ($user['role'] !== 'admin' && $user['role'] !== 'manager')) {
    json_response(['error' => 'Admin access required'], 403);
    exit;
}

try {
    // Get all ads with full details
    $stmt = $pdo->prepare("
        SELECT
            id,
            title,
            description,
            image_url,
            target_link,
            ad_type,
            target_audience,
            display_frequency,
            display_interval_hours,
            priority,
            active,
            impressions,
            clicks,
            created_at,
            updated_at
        FROM ads
        ORDER BY priority DESC, created_at DESC
    ");

    $stmt->execute();
    $ads = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate CTR for each ad
    foreach ($ads as &$ad) {
        $ad['impressions'] = (int)$ad['impressions'];
        $ad['clicks'] = (int)$ad['clicks'];
        $ad['priority'] = (int)$ad['priority'];
        $ad['active'] = (bool)$ad['active'];

        // Calculate CTR
        if ($ad['impressions'] > 0) {
            $ad['ctr'] = round(($ad['clicks'] / $ad['impressions']) * 100, 2);
        } else {
            $ad['ctr'] = 0;
        }
    }

    json_response([
        'success' => true,
        'ads' => $ads,
        'total' => count($ads),
        'active_count' => count(array_filter($ads, function($ad) { return $ad['active']; })),
        'total_impressions' => array_sum(array_column($ads, 'impressions')),
        'total_clicks' => array_sum(array_column($ads, 'clicks'))
    ]);

} catch (PDOException $e) {
    error_log("Database error in list.php: " . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
