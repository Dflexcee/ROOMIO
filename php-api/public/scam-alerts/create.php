<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'];

// Validate required fields
if (empty($input['title']) || empty($input['description'])) {
    json_response(['error' => 'Title and description are required'], 400);
    exit;
}

try {
    // Get user email for display
    $stmt = $pdo->prepare("SELECT email FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        json_response(['error' => 'User not found'], 404);
        exit;
    }

    // Insert scam alert with both user_id and email
    $stmt = $pdo->prepare("
        INSERT INTO scam_alerts (user_id, reported_by, title, description, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$userId, $user['email'], $input['title'], $input['description']]);

    $alertId = $pdo->lastInsertId();

    // Return the created alert
    json_response([
        'success' => true,
        'alert' => [
            'id' => $alertId,
            'user_id' => $userId,
            'reported_by' => $user['email'],
            'title' => $input['title'],
            'description' => $input['description'],
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (PDOException $e) {
    error_log('Scam alert creation error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>