<?php
// Admin verification review API
// Handles approve/reject actions for verification requests

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
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $request_id = $input['request_id'] ?? null;
        $action = $input['action'] ?? null; // 'approve' or 'reject'
        $message = $input['message'] ?? '';
        $admin_id = $input['admin_id'] ?? 1;
        
        if (!$request_id || !$action) {
            echo json_encode(['success' => false, 'error' => 'Missing required fields']);
            exit;
        }
        
        if (!in_array($action, ['approve', 'reject', 'suspend'])) {
            echo json_encode(['success' => false, 'error' => 'Invalid action']);
            exit;
        }
        
        // Start transaction
        $pdo->beginTransaction();
        
        try {
            // 1. Update verification request
            $new_status = ($action === 'approve') ? 'approved' : 
                         ($action === 'reject') ? 'rejected' : 
                         ($action === 'suspend') ? 'suspended' : 'pending';
            $stmt = $pdo->prepare("
                UPDATE verification_requests 
                SET status = ?, admin_message = ?, reviewed_at = NOW(), reviewed_by = ?
                WHERE id = ?
            ");
            $stmt->execute([$new_status, $message, $admin_id, $request_id]);
            
            // 2. Get user_id from the request
            $stmt = $pdo->prepare("SELECT user_id FROM verification_requests WHERE id = ?");
            $stmt->execute([$request_id]);
            $request_data = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$request_data) {
                throw new Exception('Verification request not found');
            }
            
            $user_id = $request_data['user_id'];
            
            // 3. Update user's verification status
            $user_status = ($action === 'approve') ? 'verified' : 
                          ($action === 'reject') ? 'rejected' : 
                          ($action === 'suspend') ? 'suspended' : 'pending';
            $stmt = $pdo->prepare("
                UPDATE users 
                SET verification_status = ?
                WHERE id = ?
            ");
            $stmt->execute([$user_status, $user_id]);
            
            // 4. Insert message into verification_messages table
            if (!empty($message)) {
                $stmt = $pdo->prepare("
                    INSERT INTO verification_messages 
                    (verification_request_id, from_admin_id, to_user_id, message, message_type) 
                    VALUES (?, ?, ?, ?, ?)
                ");
                $message_type = ($action === 'approve') ? 'approval' : 
                               ($action === 'reject') ? 'rejection' : 
                               ($action === 'suspend') ? 'suspension' : 'general';
                $stmt->execute([$request_id, $admin_id, $user_id, $message, $message_type]);
            }
            
            $pdo->commit();
            
            echo json_encode([
                'success' => true,
                'message' => "Verification request {$action}d successfully",
                'new_status' => $new_status
            ]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
        
    } else {
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Verification Review API Error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'error' => $e->getMessage()
    ]);
}
?>