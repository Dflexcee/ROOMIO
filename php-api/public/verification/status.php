<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

try {
    $userId = $_SESSION['user_id'];

    // Get latest verification request
    $stmt = $pdo->prepare("
        SELECT * FROM verification_requests 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
    ");
    $stmt->execute([$userId]);
    $verification = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get user verification status
    $stmt = $pdo->prepare("
        SELECT is_verified, verification_status, verified_for_rooms, verified_for_listings
        FROM users 
        WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $userStatus = $stmt->fetch(PDO::FETCH_ASSOC);

    json_response([
        'success' => true,
        'verification' => $verification,
        'user_status' => $userStatus
    ]);

} catch (PDOException $e) {
    error_log("Verification status error: " . $e->getMessage());
    json_response(['error' => 'Database error'], 500);
}
?>
