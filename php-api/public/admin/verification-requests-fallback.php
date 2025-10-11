<?php
// Fallback API for verification requests - Direct database access
// This will work even if the main API has issues

// CORS headers
require_once __DIR__ . '/../../lib/UrlHelper.php';
require_once __DIR__ . '/../../lib/Config.php';
UrlHelper::applyCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

try {
    $host = Config::get('DB_HOST', 'localhost');
    $dbname = Config::get('DB_NAME', 'roomio');
    $username = Config::get('DB_USER', 'root');
    $password = Config::get('DB_PASS', '');
    $charset = 'utf8mb4';
    
    $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";
    $pdo = new PDO($dsn, $username, $password);
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
