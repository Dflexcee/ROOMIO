<?php
// Add CORS headers
header('Content-Type: application/json');
require_once __DIR__ . '/../../lib/UrlHelper.php';
UrlHelper::applyCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../lib/Auth.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

try {
    // Get all users with profile data - dynamic column selection
    $tablesStmt = $pdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Check what columns exist in users table
    $stmt = $pdo->query("SHOW COLUMNS FROM users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Build dynamic query with available columns
    $selectFields = ['u.id', 'u.email'];
    
    foreach (['role', 'full_name', 'age', 'gender', 'university', 'department', 'budget_range', 'religion', 'lifestyle', 'avatar_url', 'about_me', 'phone', 'created_at'] as $field) {
        if (in_array($field, $columns)) {
            $selectFields[] = 'u.' . $field;
        }
    }
    
    $sql = "SELECT " . implode(', ', $selectFields) . " FROM users u WHERE u.role != 'banned' ORDER BY u.created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Add post counts and actual posts for each user
    foreach ($users as &$user) {
        // Get approved rooms
        $stmt = $pdo->prepare("SELECT * FROM rooms WHERE user_id = ? AND status = 'approved' ORDER BY created_at DESC");
        $stmt->execute([$user['id']]);
        $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Parse images JSON for rooms
        foreach ($rooms as &$room) {
            $room['images'] = json_decode($room['images'] ?? '[]', true) ?: [];
            // Convert room images to absolute URLs
            $room['images'] = array_map(function($img) {
                return UrlHelper::toAbsoluteUrl($img);
            }, $room['images']);
        }
        $user['rooms'] = $rooms;
        $user['total_rooms'] = count($rooms);

        // Get approved listings
        $stmt = $pdo->prepare("SELECT * FROM listings WHERE user_id = ? AND status = 'approved' ORDER BY created_at DESC");
        $stmt->execute([$user['id']]);
        $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Parse images JSON for listings
        foreach ($listings as &$listing) {
            $listing['images'] = json_decode($listing['images'] ?? '[]', true) ?: [];
            // Convert listing images to absolute URLs
            $listing['images'] = array_map(function($img) {
                return UrlHelper::toAbsoluteUrl($img);
            }, $listing['images']);
        }
        $user['listings'] = $listings;
        $user['total_listings'] = count($listings);

        $user['total_posts'] = $user['total_rooms'] + $user['total_listings'];
    }

    // Convert user avatar_urls to absolute URLs
    $users = UrlHelper::convertImageUrls($users);

    json_response(['users' => $users]);
    
} catch (Exception $e) {
    error_log('Users list error: ' . $e->getMessage());
    json_response(['error' => 'Database error occurred'], 500);
}
?>
