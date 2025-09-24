<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in and is admin
require_auth();
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['feature_name']) || empty($input['unlock_price'])) {
    json_response(['error' => 'Feature name and unlock price are required'], 400);
}

try {
    // Check if feature already exists
    $stmt = $pdo->prepare("SELECT id FROM payment_settings WHERE feature_name = ?");
    $stmt->execute([$input['feature_name']]);
    if ($stmt->fetch()) {
        json_response(['error' => 'Feature already exists'], 400);
    }

    // Insert new payment setting
    $stmt = $pdo->prepare("
        INSERT INTO payment_settings (feature_name, unlock_price, is_locked, duration_type, duration_value, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    ");
    $stmt->execute([
        $input['feature_name'],
        $input['unlock_price'],
        $input['is_locked'] ? 1 : 0,
        $input['duration_type'] ?? 'days',
        $input['duration_value'] ?? 7
    ]);

    $settingId = $pdo->lastInsertId();

    // Get the created setting
    $stmt = $pdo->prepare("SELECT * FROM payment_settings WHERE id = ?");
    $stmt->execute([$settingId]);
    $setting = $stmt->fetch(PDO::FETCH_ASSOC);

    json_response([
        'success' => true,
        'setting' => $setting
    ]);

} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>