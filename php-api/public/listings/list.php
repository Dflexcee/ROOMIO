<?php
/**
 * Get All Approved Listings (Public View)
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/UrlHelper.php';

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

// Pagination parameters for scalability
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = isset($_GET['limit']) ? min(100, max(1, intval($_GET['limit']))) : 20; // Max 100 per page
$offset = ($page - 1) * $limit;

try {
    // Build WHERE clause for filtering
    $whereConditions = ["l.status = 'approved'"];
    $params = [];

    if ($type && in_array($type, ['land', 'house', 'car', 'other'])) {
        $whereConditions[] = "l.type = ?";
        $params[] = $type;
    }

    if ($search) {
        $whereConditions[] = "(l.title LIKE ? OR l.description LIKE ? OR l.location LIKE ?)";
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    if ($location) {
        $whereConditions[] = "l.location LIKE ?";
        $params[] = "%{$location}%";
    }

    if ($minPrice > 0) {
        $whereConditions[] = "l.price >= ?";
        $params[] = $minPrice;
    }

    if ($maxPrice > 0) {
        $whereConditions[] = "l.price <= ?";
        $params[] = $maxPrice;
    }

    $whereClause = implode(' AND ', $whereConditions);

    // Get total count for pagination metadata
    $countSql = "SELECT COUNT(*) as total FROM listings l WHERE {$whereClause}";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $totalRecords = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    $totalPages = ceil($totalRecords / $limit);

    // Get paginated listings
    $sql = "
        SELECT
            l.*,
            u.full_name as poster_name,
            u.email as poster_email,
            u.avatar_url as poster_avatar,
            u.phone as poster_phone
        FROM listings l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE {$whereClause}
        ORDER BY l.created_at DESC
        LIMIT ? OFFSET ?
    ";

    $params[] = $limit;
    $params[] = $offset;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
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
        // Convert poster avatar to absolute URL
        if (isset($listing['poster_avatar']) && !empty($listing['poster_avatar'])) {
            $listing['poster_avatar'] = UrlHelper::toAbsoluteUrl($listing['poster_avatar']);
        }
    }

    json_response([
        'success' => true,
        'listings' => $listings,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total_records' => $totalRecords,
            'total_pages' => $totalPages,
            'has_next' => $page < $totalPages,
            'has_prev' => $page > 1
        ],
        'total' => count($listings)
    ]);

} catch (PDOException $e) {
    error_log('Listings fetch error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>