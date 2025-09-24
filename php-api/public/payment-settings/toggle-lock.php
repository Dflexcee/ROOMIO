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
if (empty($input['id']) || !isset($input['is_locked'])) {
    json_response(['error' => 'ID and is_locked are required'], 400);
}

try {
    $stmt = $pdo->prepare("UPDATE payment_settings SET is_locked = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$input['is_locked'] ? 1 : 0, $input['id']]);

    if ($stmt->rowCount() === 0) {
        json_response(['error' => 'Setting not found'], 404);
    }

    json_response([
        'success' => true,
        'message' => 'Lock status updated successfully'
    ]);

} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
