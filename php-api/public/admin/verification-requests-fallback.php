<?php
// Fallback API for verification requests - Direct database access
// This will work even if the main API has issues

// CORS headers
$allowed_origins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: http://localhost:5174'); // Fallback
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=roomio;charset=utf8mb4', 'ruser', 'cord3001');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Check if verification_requests table exists
        $stmt = $pdo->query("SHOW TABLES LIKE 'verification_requests'");
        $tableExists = $stmt->rowCount() > 0;
        
        if (!$tableExists) {
            echo json_encode([
                'success' => false,
                'error' => 'Verification requests table does not exist. Please run the database setup script first.',
                'requests' => []
            ]);
            exit;
        }
        
        // Get all verification requests
        $sql = "SELECT 
                    vr.*,
                    u.email as user_email,
                    u.full_name as user_full_name,
                    admin.full_name as reviewed_by_name
                FROM verification_requests vr
                LEFT JOIN users u ON vr.user_id = u.id
                LEFT JOIN users admin ON vr.reviewed_by = admin.id
                ORDER BY vr.created_at DESC";
        
        $stmt = $pdo->query($sql);
        $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Add some debug info
        $debug_info = [
            'table_exists' => $tableExists,
            'total_requests' => count($requests),
            'sql_query' => $sql
        ];
        
        echo json_encode([
            'success' => true,
            'requests' => $requests,
            'debug' => $debug_info
        ]);
        
    } else {
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Verification Requests Fallback API Error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage(),
        'requests' => []
    ]);
}
?>
