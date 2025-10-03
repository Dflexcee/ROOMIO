<?php
/**
 * Admin Edit Listing
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

$admin = require_admin($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$listing_id = (int)($input['listing_id'] ?? 0);

if (!$listing_id) {
    json_response(['error' => 'Listing ID required'], 400);
    exit;
}

try {
    // Prepare images JSON
    $images = $input['images'] ?? [];
    if (is_array($images)) {
        $imagesJson = json_encode(array_values($images));
    } else {
        $imagesJson = '[]';
    }

    $stmt = $pdo->prepare("
        UPDATE listings
        SET title = ?, description = ?, price = ?, location = ?, type = ?,
            specifications = ?, images = ?, contact_phone = ?, contact_email = ?,
            updated_at = NOW()
        WHERE id = ?
    ");

    $stmt->execute([
        $input['title'],
        $input['description'],
        $input['price'],
        $input['location'],
        $input['type'] ?? 'other',
        $input['specifications'] ?? '',
        $imagesJson,
        $input['contact_phone'],
        $input['contact_email'],
        $listing_id
    ]);

    // Log action
    $stmt = $pdo->prepare("
        INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $admin['id'],
        'listing_edit',
        json_encode(['listing_id' => $listing_id, 'admin_email' => $admin['email']]),
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    json_response(['success' => true, 'message' => 'Listing updated successfully']);
} catch (PDOException $e) {
    error_log('Listing edit error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>