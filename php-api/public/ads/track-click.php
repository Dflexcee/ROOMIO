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
$user_id = $_SESSION['user_id'] ?? null;

try {
    // Get user details if logged in
    $user_email = null;
    $user_name = null;
    if ($user_id) {
        $stmt = $pdo->prepare("SELECT email, CONCAT(first_name, ' ', last_name) as name FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($userData) {
            $user_email = $userData['email'];
            $user_name = $userData['name'];
        }
    }

    // Record click with timestamp and tracking info
    $stmt = $pdo->prepare("
        INSERT INTO ad_clicks (ad_id, user_id, user_email, user_name, ip_address, user_agent, clicked_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $ad_id,
        $user_id,
        $user_email,
        $user_name,
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);

    // Increment clicks count
    $pdo->prepare("UPDATE ads SET clicks = clicks + 1 WHERE id = ?")->execute([$ad_id]);

    json_response(['success' => true]);

} catch (PDOException $e) {
    error_log("Database error in track-click.php: " . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
