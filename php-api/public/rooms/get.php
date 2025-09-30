<?php
// Add CORS headers
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
    // Check if profiles table exists and get its structure
    $stmt = $pdo->query("SHOW TABLES LIKE 'profiles'");
    $profilesTableExists = $stmt->rowCount() > 0;
    
    if ($profilesTableExists) {
        // Check profiles table structure to see what columns exist
        $stmt = $pdo->query("DESCRIBE profiles");
        $profileColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Check if profiles has user_id column
        if (in_array('user_id', $profileColumns)) {
            // Get room details with profiles table using user_id
            $stmt = $pdo->prepare("
                SELECT 
                    r.*,
                    u.email as owner_email,
                    COALESCE(p.full_name, u.full_name, 'Unknown') as owner_name
                FROM rooms r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE r.id = ?
            ");
        } else if (in_array('id', $profileColumns)) {
            // Get room details with profiles table using id
            $stmt = $pdo->prepare("
                SELECT 
                    r.*,
                    u.email as owner_email,
                    COALESCE(p.full_name, u.full_name, 'Unknown') as owner_name
                FROM rooms r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN profiles p ON u.id = p.id
                WHERE r.id = ?
            ");
        } else {
            // Profiles table exists but has unknown structure, skip it
            $stmt = $pdo->prepare("
                SELECT 
                    r.*,
                    u.email as owner_email,
                    COALESCE(u.full_name, 'Unknown') as owner_name
                FROM rooms r
                LEFT JOIN users u ON r.user_id = u.id
                WHERE r.id = ?
            ");
        }
    } else {
        // Get room details without profiles table
        $stmt = $pdo->prepare("
            SELECT 
                r.*,
                u.email as owner_email,
                COALESCE(u.full_name, 'Unknown') as owner_name
            FROM rooms r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        ");
    }
    
    $stmt->execute([$room_id]);
    $room = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$room) {
        echo json_encode(['error' => 'Room not found']);
        http_response_code(404);
        exit;
    }
    
    // Check if user owns this room or is admin
    $user_id = $_SESSION['user_id'];
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($room['user_id'] != $user_id && (!$user || $user['role'] !== 'admin')) {
        echo json_encode(['error' => 'You can only edit your own rooms']);
        http_response_code(403);
        exit;
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
    error_log('Room get error: ' . $e->getMessage());
    echo json_encode([
        'error' => 'Database error occurred',
        'details' => $e->getMessage(),
        'room_id' => $room_id
    ]);
    http_response_code(500);
}
?>
