<?php
/**
 * Update Listing
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

$user = require_auth($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$listing_id = (int)($input['id'] ?? 0);

if (!$listing_id) {
    json_response(['error' => 'Listing ID is required'], 400);
    exit;
}

try {
    // Check ownership
    $stmt = $pdo->prepare("SELECT * FROM listings WHERE id = ? AND user_id = ?");
    $stmt->execute([$listing_id, $user['id']]);
    $listing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$listing) {
        json_response(['error' => 'Listing not found or you do not have permission'], 404);
        exit;
    }

    // Update fields
    $title = isset($input['title']) ? trim($input['title']) : $listing['title'];
    $description = isset($input['description']) ? trim($input['description']) : $listing['description'];
    $price = isset($input['price']) ? floatval($input['price']) : $listing['price'];
    $location = isset($input['location']) ? trim($input['location']) : $listing['location'];
    $images = isset($input['images']) && is_array($input['images']) ? json_encode($input['images']) : $listing['images'];
    $specifications = isset($input['specifications']) && is_array($input['specifications']) ? json_encode($input['specifications']) : $listing['specifications'];
    $contact_phone = isset($input['contact_phone']) ? trim($input['contact_phone']) : $listing['contact_phone'];
    $contact_email = isset($input['contact_email']) ? trim($input['contact_email']) : $listing['contact_email'];

    $stmt = $pdo->prepare("
        UPDATE listings
        SET title = ?, description = ?, price = ?, location = ?,
            images = ?, specifications = ?, contact_phone = ?, contact_email = ?,
            status = 'pending', updated_at = NOW()
        WHERE id = ? AND user_id = ?
    ");

    $stmt->execute([
        $title, $description, $price, $location,
        $images, $specifications, $contact_phone, $contact_email,
        $listing_id, $user['id']
    ]);

    json_response([
        'success' => true,
        'message' => 'Listing updated successfully and set to pending approval'
    ]);

} catch (PDOException $e) {
    error_log('Listing update error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>