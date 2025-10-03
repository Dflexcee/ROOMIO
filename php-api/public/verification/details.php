<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is admin
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !in_array($user['role'], ['admin', 'manager'])) {
    json_response(['error' => 'Admin access required'], 403);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if (!$userId) {
    json_response(['error' => 'User ID required'], 400);
    exit;
}

try {
    // Get the most recent verification request for this user
    $stmt = $pdo->prepare("
        SELECT *
        FROM verification_requests
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    ");
    $stmt->execute([$userId]);
    $verification = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$verification) {
        json_response(['success' => false, 'message' => 'No verification found'], 404);
        exit;
    }

    json_response([
        'success' => true,
        'verification' => $verification
    ]);

} catch (PDOException $e) {
    error_log('Verification details error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
