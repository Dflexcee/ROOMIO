<?php
// Add CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../lib/Auth.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$room_id = isset($input['id']) ? (int)$input['id'] : 0;

if ($room_id <= 0) {
    json_response(['error' => 'Valid room ID is required'], 400);
    exit;
}

try {
    // Check if room exists and user owns it
    $stmt = $pdo->prepare("
        SELECT user_id 
        FROM rooms 
        WHERE id = ?
    ");
    $stmt->execute([$room_id]);
    $room = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$room) {
        json_response(['error' => 'Room not found'], 404);
        exit;
    }
    
    // Check if user owns this room or is admin
    $user_id = $_SESSION['user_id'];
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($room['user_id'] != $user_id && (!$user || $user['role'] !== 'admin')) {
        json_response(['error' => 'You can only edit your own rooms'], 403);
        exit;
    }
    
    // Check what columns exist in rooms table
    $stmt = $pdo->query("SHOW COLUMNS FROM rooms");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Build dynamic update query
    $updateFields = [];
    $values = [];
    
    // Core fields
    if (isset($input['title']) && in_array('title', $columns)) {
        $updateFields[] = 'title = ?';
        $values[] = $input['title'];
    }
    
    if (isset($input['description']) && in_array('description', $columns)) {
        $updateFields[] = 'description = ?';
        $values[] = $input['description'];
    }
    
    if (isset($input['location']) && in_array('location', $columns)) {
        $updateFields[] = 'location = ?';
        $values[] = $input['location'];
    }
    
    if (isset($input['rent']) && in_array('rent', $columns)) {
        $updateFields[] = 'rent = ?';
        $values[] = (float)$input['rent'];
    }
    
    if (isset($input['status']) && in_array('status', $columns)) {
        $updateFields[] = 'status = ?';
        $values[] = $input['status'];
    }
    
    if (isset($input['images']) && in_array('images', $columns)) {
        $updateFields[] = 'images = ?';
        $values[] = json_encode($input['images']);
    }
    
    if (isset($input['amenities']) && in_array('amenities', $columns)) {
        $updateFields[] = 'amenities = ?';
        $values[] = json_encode($input['amenities']);
    }
    
    // Add updated timestamp if column exists
    if (in_array('updated_at', $columns)) {
        $updateFields[] = 'updated_at = NOW()';
    }
    
    if (empty($updateFields)) {
        json_response(['error' => 'No valid fields to update'], 400);
        exit;
    }
    
    // Add room ID for WHERE clause
    $values[] = $room_id;
    
    $sql = "UPDATE rooms SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute($values);
    
    if ($result && $stmt->rowCount() > 0) {
        json_response([
            'success' => true,
            'message' => 'Room updated successfully',
            'room_id' => $room_id
        ]);
    } else {
        json_response([
            'success' => false,
            'error' => 'No changes made to room'
        ]);
    }
    
} catch (Exception $e) {
    error_log('Room update error: ' . $e->getMessage());
    json_response(['error' => 'Database error occurred'], 500);
}
?>
