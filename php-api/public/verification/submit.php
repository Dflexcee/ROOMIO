<?php
// Submit verification request
// This handles the verification form submission

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
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required_fields = ['account_type', 'full_name', 'phone'];
        foreach ($required_fields as $field) {
            if (empty($input[$field])) {
                throw new Exception("Field '$field' is required");
            }
        }
        
        // Get user ID from session or auth (you'll need to implement this)
        // For now, we'll use a placeholder - you should get this from your auth system
        $user_id = $input['user_id'] ?? 1; // This should come from your authentication
        
        // Check if user already has a pending verification request
        $stmt = $pdo->prepare("SELECT id FROM verification_requests WHERE user_id = ? AND status = 'pending'");
        $stmt->execute([$user_id]);
        if ($stmt->rowCount() > 0) {
            throw new Exception("You already have a pending verification request");
        }
        
        // Prepare data for insertion
        $account_type = $input['account_type'];
        $full_name = trim($input['full_name']);
        $phone = trim($input['phone']);
        $profile_picture = $input['profile_picture'] ?? null;
        
        // Handle different account types
        if ($account_type === 'student') {
            $government_id_type = null;
            $government_id_number = null;
            $government_id_image = null;
            $nin = null;
            $school_id_type = $input['school_id_type'] ?? null;
            $school_id_number = $input['school_id_number'] ?? null;
            $school_id_image = $input['school_id_image'] ?? null;
            $school_name = $input['school_name'] ?? null;
            
            // Validate student fields
            if (empty($school_id_type) || empty($school_id_number) || empty($school_id_image) || empty($school_name)) {
                throw new Exception("School information is required for students");
            }
        } else {
            $government_id_type = $input['government_id_type'] ?? null;
            $government_id_number = $input['government_id_number'] ?? null;
            $government_id_image = $input['government_id_image'] ?? null;
            $nin = $input['nin'] ?? null;
            $school_id_type = null;
            $school_id_number = null;
            $school_id_image = null;
            $school_name = null;
            
            // Validate non-student fields
            if (empty($government_id_type) || empty($government_id_number) || empty($government_id_image) || empty($nin)) {
                throw new Exception("Government ID information is required");
            }
        }
        
        // Insert verification request
        $stmt = $pdo->prepare("
            INSERT INTO verification_requests (
                user_id, account_type, full_name, phone, profile_picture,
                government_id_type, government_id_number, government_id_image, nin,
                school_id_type, school_id_number, school_id_image, school_name,
                status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        ");
        
        $stmt->execute([
            $user_id, $account_type, $full_name, $phone, $profile_picture,
            $government_id_type, $government_id_number, $government_id_image, $nin,
            $school_id_type, $school_id_number, $school_id_image, $school_name
        ]);
        
        $verification_id = $pdo->lastInsertId();
        
        // Update user's verification status and account type
        $stmt = $pdo->prepare("
            UPDATE users 
            SET verification_status = 'pending', 
                account_type = ?, 
                verification_request_id = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$account_type, $verification_id, $user_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Verification request submitted successfully',
            'verification_id' => $verification_id
        ]);
        
    } else {
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Verification Submit Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
