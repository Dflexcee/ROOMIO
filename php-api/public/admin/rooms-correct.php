<?php
// Admin Rooms API - Using Correct Table Structure
header('Content-Type: application/json');
require_once __DIR__ . '/../../lib/UrlHelper.php';
require_once __DIR__ . '/../../lib/Config.php';
UrlHelper::applyCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

try {
    // Database connection using config
    $host = Config::get('DB_HOST', 'localhost');
    $dbname = Config::get('DB_NAME', 'roomio');
    $username = Config::get('DB_USER', 'root');
    $password = Config::get('DB_PASS', '');
    $charset = 'utf8mb4';
    
    $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $pdo = new PDO($dsn, $username, $password, $options);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get ALL rooms from the actual rooms table
        $stmt = $pdo->query("
            SELECT 
                r.id,
                r.title,
                r.description,
                r.location,
                r.rent,
                r.status,
                r.created_at,
                r.user_id,
                u.email,
                COALESCE(p.full_name, CONCAT('User ', r.user_id)) as full_name,
                COALESCE(p.phone, 'N/A') as phone
            FROM rooms r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN profiles p ON u.id = p.user_id
            ORDER BY r.created_at DESC
        ");
        
        $listings = $stmt->fetchAll();
        
        // Ensure proper data types
        foreach ($listings as &$listing) {
            $listing['id'] = (int)$listing['id'];
            $listing['rent'] = (int)$listing['rent'];
            $listing['user_id'] = (int)$listing['user_id'];
            // Clean up data
            if (empty($listing['title'])) {
                $listing['title'] = 'Untitled Listing';
            }
            if (empty($listing['description'])) {
                $listing['description'] = 'No description';
            }
            if (empty($listing['location'])) {
                $listing['location'] = 'Location not specified';
            }
            if (empty($listing['status'])) {
                $listing['status'] = 'active';
            }
        }
        
        echo json_encode([
            'success' => true,
            'listings' => $listings,
            'message' => 'All rooms from database - ' . count($listings) . ' listings found'
        ]);
        
    } else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Handle room status updates
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['room_id']) && isset($input['status'])) {
            $room_id = (int)$input['room_id'];
            $status = $input['status'];
            
            $stmt = $pdo->prepare("UPDATE rooms SET status = ? WHERE id = ?");
            $result = $stmt->execute([$status, $room_id]);
            
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => "Room $room_id status updated to $status"
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to update room status'
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'Missing room_id or status'
            ]);
        }
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
