<?php
// Get verification status for current user
// This checks the user's verification status and any messages

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
        // Get user ID from session or auth (you'll need to implement this)
        // For now, we'll use a placeholder - you should get this from your auth system
        $user_id = $_GET['user_id'] ?? 1; // This should come from your authentication
        
        // Get user's verification status
        $stmt = $pdo->prepare("
            SELECT 
                u.verification_status,
                u.account_type,
                vr.id as verification_request_id,
                vr.status as request_status,
                vr.admin_message,
                vr.reviewed_at,
                vr.created_at as request_created_at
            FROM users u
            LEFT JOIN verification_requests vr ON u.verification_request_id = vr.id
            WHERE u.id = ?
        ");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        
        if (!$user) {
            throw new Exception("User not found");
        }
        
        // Get any unread messages for this user
        $stmt = $pdo->prepare("
            SELECT 
                vm.message,
                vm.message_type,
                vm.created_at,
                u.full_name as admin_name
            FROM verification_messages vm
            LEFT JOIN users u ON vm.from_admin_id = u.id
            WHERE vm.to_user_id = ? AND vm.is_read = 0
            ORDER BY vm.created_at DESC
        ");
        $stmt->execute([$user_id]);
        $messages = $stmt->fetchAll();
        
        // Determine the current status
        $status = $user['verification_status'] ?: 'unverified';
        $message = '';
        
        if ($user['admin_message']) {
            $message = $user['admin_message'];
        } elseif (!empty($messages)) {
            $message = $messages[0]['message'];
        }
        
        echo json_encode([
            'success' => true,
            'status' => $status,
            'account_type' => $user['account_type'],
            'message' => $message,
            'verification_request_id' => $user['verification_request_id'],
            'request_status' => $user['request_status'],
            'reviewed_at' => $user['reviewed_at'],
            'request_created_at' => $user['request_created_at'],
            'unread_messages' => count($messages)
        ]);
        
    } else {
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Verification Status Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
