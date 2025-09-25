<?php
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

$sql = "SELECT id, title, description, location, rent, status, user_id, images, amenities, created_at, updated_at
        FROM rooms WHERE 1=1";
$params = [];

if ($status !== '') {
    $sql .= " AND status = ?";
    $params[] = $status;
}
if ($location !== '') {
    $sql .= " AND location LIKE ?";
    $params[] = "%{$location}%";
}
if ($minRent !== null) {
    $sql .= " AND rent >= ?";
    $params[] = $minRent;
}
if ($maxRent !== null) {
    $sql .= " AND rent <= ?";
    $params[] = $maxRent;
}
if ($q !== '') {
    $sql .= " AND (title LIKE ? OR description LIKE ?)";
    $params[] = "%{$q}%";
    $params[] = "%{$q}%";
}
$sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
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
    } else {
        $row['images'] = [];
    }
    if (isset($row['amenities']) && $row['amenities'] !== null && $row['amenities'] !== '') {
        $decoded = json_decode($row['amenities'], true);
        $row['amenities'] = $decoded !== null ? $decoded : [];
    } else {
        $row['amenities'] = [];
    }
}

json_response(['rooms' => $rows]); 
