<?php
/**
 * Track ad click
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$ad_id = (int)($input['ad_id'] ?? 0);

if (!$ad_id) {
    json_response(['error' => 'Ad ID required'], 400);
    exit;
}

// Get current user (optional)
$user = null;
try {
    $user = get_current_user($pdo);
} catch (Exception $e) {
    // Not logged in, that's fine
}

try {
    // Record click
    $stmt = $pdo->prepare("
        INSERT INTO ad_clicks (ad_id, user_id)
        VALUES (?, ?)
    ");
    $stmt->execute([$ad_id, $user ? $user['id'] : null]);

    // Increment clicks count
    $pdo->prepare("UPDATE ads SET clicks = clicks + 1 WHERE id = ?")->execute([$ad_id]);

    json_response(['success' => true]);

} catch (PDOException $e) {
    error_log("Database error in track-click.php: " . $e->getMessage());
    json_response(['error' => 'Database error'], 500);
}
?>