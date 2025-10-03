<?php
/**
 * Admin Delete Listing
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

$admin = require_admin($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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
    // Log before deleting
    $stmt = $pdo->prepare("SELECT title FROM listings WHERE id = ?");
    $stmt->execute([$listing_id]);
    $listing = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("DELETE FROM listings WHERE id = ?");
    $stmt->execute([$listing_id]);

    // Log action
    $stmt = $pdo->prepare("
        INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $admin['id'],
        'listing_delete',
        json_encode([
            'listing_id' => $listing_id,
            'title' => $listing['title'] ?? 'Unknown',
            'admin_email' => $admin['email']
        ]),
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    json_response(['success' => true, 'message' => 'Listing deleted successfully']);
} catch (PDOException $e) {
    error_log('Listing delete error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>