<?php
/**
 * Create New Listing (Land, House, Car, Other)
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

$user = require_auth($pdo);

// Admins bypass all checks
$isAdmin = in_array($user['role'] ?? '', ['admin', 'manager']);

if (!$isAdmin) {
    // Read app settings for verification requirements
    $requirePosting = 1;
    $requireListings = 0;
    try {
        $stmt = $pdo->prepare("SELECT setting_key, setting_value FROM settings WHERE category = 'app' AND setting_key IN ('require_verification_posting','require_verification_listings')");
        $stmt->execute();
        $kv = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) { $kv[$row['setting_key']] = (int)$row['setting_value']; }
        $requirePosting = $kv['require_verification_posting'] ?? 1;
        $requireListings = $kv['require_verification_listings'] ?? 0;
    } catch (Throwable $e) { /* defaults */ }
    // Check posting access first
    if (isset($user['can_post_listings']) && $user['can_post_listings'] == 0) {
        json_response([
            'error' => 'You do not have permission to post listings',
            'reason' => $user['posting_suspended_reason'] ?? 'Permission denied',
            'status_code' => 'POSTING_RESTRICTED'
        ], 403);
        exit;
    }

    // Check verification status if required
    $hasPerType = (int)($user['verified_for_listings'] ?? 0) === 1;
    $isGloballyVerified = isset($user['verification_status']) && in_array($user['verification_status'], ['verified', 'approved']);
    if (($requirePosting || $requireListings) && !($isGloballyVerified || $hasPerType)) {
        json_response([
            'error' => 'You must be verified to post listings',
            'verification_status' => $user['verification_status'] ?? 'unverified',
            'verified_for_listings' => (bool)($user['verified_for_listings'] ?? 0),
            'status_code' => 'VERIFICATION_REQUIRED'
        ], 403);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$type = isset($input['type']) ? trim($input['type']) : '';
$title = isset($input['title']) ? trim($input['title']) : '';
$description = isset($input['description']) ? trim($input['description']) : '';
$price = isset($input['price']) ? floatval($input['price']) : 0;
$location = isset($input['location']) ? trim($input['location']) : '';
$images = isset($input['images']) && is_array($input['images']) ? $input['images'] : [];
$specifications = isset($input['specifications']) && is_array($input['specifications']) ? $input['specifications'] : [];
$contact_phone = isset($input['contact_phone']) ? trim($input['contact_phone']) : '';
$contact_email = isset($input['contact_email']) ? trim($input['contact_email']) : $user['email'];

// Validation
if (!in_array($type, ['land', 'house', 'car', 'other'])) {
    json_response(['error' => 'Invalid listing type'], 400);
    exit;
}

if ($title === '' || $location === '' || $price <= 0) {
    json_response(['error' => 'Title, location, and price are required'], 400);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO listings (
            user_id, type, title, description, price, location,
            images, specifications, contact_phone, contact_email,
            status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    ");

    $stmt->execute([
        $user['id'],
        $type,
        $title,
        $description,
        $price,
        $location,
        json_encode($images),
        json_encode($specifications),
        $contact_phone,
        $contact_email
    ]);

    $listingId = $pdo->lastInsertId();

    json_response([
        'success' => true,
        'message' => 'Listing created successfully and is pending approval',
        'listing_id' => $listingId
    ], 201);

} catch (PDOException $e) {
    error_log('Listing creation error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>