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

// Filters
$location = isset($_GET['location']) ? trim($_GET['location']) : '';
$status = isset($_GET['status']) ? trim($_GET['status']) : 'approved';
$minRent = isset($_GET['min_rent']) ? floatval($_GET['min_rent']) : null;
$maxRent = isset($_GET['max_rent']) ? floatval($_GET['max_rent']) : null;
$q = isset($_GET['q']) ? trim($_GET['q']) : '';
$limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 20;
$offset = isset($_GET['offset']) ? max(0, intval($_GET['offset'])) : 0;

$sql = "SELECT r.id, r.title, r.description, r.location, r.rent, r.gender_preference, r.role, r.conditions, r.status, r.user_id, r.images, r.amenities, r.created_at as posted_at, r.updated_at,
               u.full_name as poster_name, u.email as poster_email, u.avatar_url as poster_avatar, u.phone as poster_phone
        FROM rooms r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE 1=1";
$params = [];

if ($status !== '') {
    $sql .= " AND r.status = ?";
    $params[] = $status;
}
if ($location !== '') {
    $sql .= " AND r.location LIKE ?";
    $params[] = "%{$location}%";
}
if ($minRent !== null) {
    $sql .= " AND r.rent >= ?";
    $params[] = $minRent;
}
if ($maxRent !== null) {
    $sql .= " AND r.rent <= ?";
    $params[] = $maxRent;
}
if ($q !== '') {
    $sql .= " AND (r.title LIKE ? OR r.description LIKE ?)";
    $params[] = "%{$q}%";
    $params[] = "%{$q}%";
}
$sql .= " ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

// Decode JSON columns if present
foreach ($rows as &$row) {
    if (isset($row['images']) && $row['images'] !== null && $row['images'] !== '') {
        $decoded = json_decode($row['images'], true);
        $row['images'] = $decoded !== null ? $decoded : [];
        // Convert image paths to absolute URLs
        $row['images'] = array_map(function($img) {
            return UrlHelper::toAbsoluteUrl($img);
        }, $row['images']);
    } else {
        $row['images'] = [];
    }
    if (isset($row['amenities']) && $row['amenities'] !== null && $row['amenities'] !== '') {
        $decoded = json_decode($row['amenities'], true);
        $row['amenities'] = $decoded !== null ? $decoded : [];
    } else {
        $row['amenities'] = [];
    }
    // Convert poster avatar to absolute URL
    if (isset($row['poster_avatar']) && !empty($row['poster_avatar'])) {
        $row['poster_avatar'] = UrlHelper::toAbsoluteUrl($row['poster_avatar']);
    }
}

json_response(['rooms' => $rows]); 
