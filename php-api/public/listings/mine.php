<?php
/**
 * Get User's Own Listings
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';
require_once '../../lib/UrlHelper.php';

$user = require_auth($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT * FROM listings
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$user['id']]);
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Parse JSON fields
    foreach ($listings as &$listing) {
        if (isset($listing['images']) && is_string($listing['images'])) {
            $listing['images'] = json_decode($listing['images'], true) ?: [];
            // Convert image paths to absolute URLs
            $listing['images'] = array_map(function($img) {
                return UrlHelper::toAbsoluteUrl($img);
            }, $listing['images']);
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
    error_log('My listings fetch error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>