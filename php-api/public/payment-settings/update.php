<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['id']) || empty($input['field']) || !isset($input['value'])) {
    json_response(['error' => 'ID, field, and value are required'], 400);
}

$allowedFields = ['unlock_price', 'duration_type', 'duration_value'];
if (!in_array($input['field'], $allowedFields)) {
    json_response(['error' => 'Invalid field'], 400);
}

try {
    $stmt = $pdo->prepare("UPDATE payment_settings SET {$input['field']} = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$input['value'], $input['id']]);

    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'Setting not found'], 404);
    }

    json_response([
        'success' => true,
        'message' => 'Setting updated successfully'
    ]);

} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
