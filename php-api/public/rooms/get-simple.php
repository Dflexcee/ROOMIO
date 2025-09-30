<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Authentication required']);
    http_response_code(401);
    exit;
}

$room_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($room_id <= 0) {
    echo json_encode(['error' => 'Valid room ID is required']);
    http_response_code(400);
    exit;
}

try {
    // Simple query - just get the room data without any joins
    $stmt = $pdo->prepare("SELECT * FROM rooms WHERE id = ?");
    $stmt->execute([$room_id]);
    $room = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$room) {
        echo json_encode(['error' => 'Room not found']);
        http_response_code(404);
        exit;
    }
    
    // Get user info separately
    $stmt = $pdo->prepare("SELECT email, full_name FROM users WHERE id = ?");
    $stmt->execute([$room['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        $room['owner_email'] = $user['email'];
        $room['owner_name'] = $user['full_name'] ?: 'Unknown';
    } else {
        $room['owner_email'] = 'Unknown';
        $room['owner_name'] = 'Unknown';
    }
    
    // Decode JSON fields if they exist
    if (isset($room['images']) && $room['images']) {
        $room['images'] = json_decode($room['images'], true) ?: [];
    } else {
        $room['images'] = [];
    }
    
    if (isset($room['amenities']) && $room['amenities']) {
        $room['amenities'] = json_decode($room['amenities'], true) ?: [];
    } else {
        $room['amenities'] = [];
    }
    
    echo json_encode([
        'success' => true,
        'room' => $room
    ]);
    
} catch (Exception $e) {
    error_log('Room get simple error: ' . $e->getMessage());
    echo json_encode([
        'error' => 'Database error occurred',
        'details' => $e->getMessage(),
        'room_id' => $room_id
    ]);
    http_response_code(500);
}
?>
