<?php
/**
 * Get All Approved Listings (Public View)
 */

require_once '../../config.php';
require_once '../../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

// Get query parameters for filtering
$type = isset($_GET['type']) ? $_GET['type'] : '';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$minPrice = isset($_GET['minPrice']) ? floatval($_GET['minPrice']) : 0;
$maxPrice = isset($_GET['maxPrice']) ? floatval($_GET['maxPrice']) : 0;
$location = isset($_GET['location']) ? trim($_GET['location']) : '';

try {
    // Build query
    $sql = "
        SELECT
            l.*,
            u.full_name as poster_name,
            u.email as poster_email,
            u.avatar_url as poster_avatar,
            u.phone as poster_phone
        FROM listings l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.status = 'approved'
    ";

    $params = [];

    if ($type && in_array($type, ['land', 'house', 'car', 'other'])) {
        $sql .= " AND l.type = ?";
        $params[] = $type;
    }

    if ($search) {
        $sql .= " AND (l.title LIKE ? OR l.description LIKE ? OR l.location LIKE ?)";
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    if ($location) {
        $sql .= " AND l.location LIKE ?";
        $params[] = "%{$location}%";
    }

    if ($minPrice > 0) {
        $sql .= " AND l.price >= ?";
        $params[] = $minPrice;
    }

    if ($maxPrice > 0) {
        $sql .= " AND l.price <= ?";
        $params[] = $maxPrice;
    }

    $sql .= " ORDER BY l.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $listings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Parse JSON fields
    foreach ($listings as &$listing) {
        if (isset($listing['images']) && is_string($listing['images'])) {
            $listing['images'] = json_decode($listing['images'], true) ?: [];
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
    error_log('Listings fetch error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>