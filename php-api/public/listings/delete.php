<?php
/**
 * Delete Listing
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

$user = require_auth($pdo);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $listingId = $input['listing_id'] ?? null;

    if (!$listingId) {
        json_response(['error' => 'Listing ID is required'], 400);
        exit;
    }

    // Check if listing exists and belongs to user
    $stmt = $pdo->prepare("SELECT * FROM listings WHERE id = ? AND user_id = ?");
    $stmt->execute([$listingId, $user['id']]);
    $listing = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$listing) {
        json_response(['error' => 'Listing not found or you do not have permission to delete it'], 404);
        exit;
    }

    // Delete images from filesystem
    if (isset($listing['images']) && is_string($listing['images'])) {
        $images = json_decode($listing['images'], true);
        if (is_array($images)) {
            foreach ($images as $imageUrl) {
                // Extract filename from URL
                $filename = basename($imageUrl);
                $filepath = __DIR__ . '/../../uploads/listing-images/' . $filename;
                if (file_exists($filepath)) {
                    @unlink($filepath);
                }
            }
        }
    }

    // Delete listing from database
    $stmt = $pdo->prepare("DELETE FROM listings WHERE id = ?");
    $stmt->execute([$listingId]);

    // Log action
    $logStmt = $pdo->prepare("
        INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
        VALUES (?, 'listing_deleted', ?, ?, NOW())
    ");
    $logStmt->execute([
        $user['id'],
        json_encode(['listing_id' => $listingId, 'title' => $listing['title']]),
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    json_response([
        'success' => true,
        'message' => 'Listing deleted successfully'
    ]);

} catch (PDOException $e) {
    error_log('Listing deletion error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
