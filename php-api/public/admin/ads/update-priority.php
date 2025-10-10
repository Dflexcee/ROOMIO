<?php
/**
 * Update Ad Priority
 * Allows admins to change the rotation order of ads
 */

require_once '../../../config.php';
require_once '../../../bootstrap.php';
require_once '../../../lib/Auth.php';

// Handle CORS
$allowed_origins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
}

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

// Check if user is admin
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Unauthorized'], 401);
    exit;
}

$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || $user['role'] !== 'admin') {
    json_response(['error' => 'Admin access required'], 403);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$ad_id = (int)($input['ad_id'] ?? 0);
$priority = (int)($input['priority'] ?? 50);

if (!$ad_id) {
    json_response(['error' => 'Ad ID required'], 400);
    exit;
}

// Validate priority range
if ($priority < 1 || $priority > 100) {
    json_response(['error' => 'Priority must be between 1 and 100'], 400);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE ads SET priority = ? WHERE id = ?");
    $stmt->execute([$priority, $ad_id]);

    if ($stmt->rowCount() > 0) {
        json_response([
            'success' => true,
            'message' => 'Priority updated successfully',
            'ad_id' => $ad_id,
            'new_priority' => $priority
        ]);
    } else {
        json_response(['error' => 'Ad not found'], 404);
    }

} catch (PDOException $e) {
    error_log("Database error in update-priority.php: " . $e->getMessage());
    json_response(['error' => 'Database error'], 500);
}
?>
