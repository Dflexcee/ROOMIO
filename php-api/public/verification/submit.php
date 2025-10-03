<?php
require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

// Get authenticated user - disable status check to avoid double JSON output
$user = require_auth($pdo, false);

if (!$user || !isset($user['id'])) {
    json_response(['error' => 'Authentication failed'], 401);
    exit;
}

$user_id = $user['id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    try {
        // Validate required fields
        $required_fields = ['account_type', 'full_name', 'phone'];
        foreach ($required_fields as $field) {
            if (empty($input[$field])) {
                json_response(['error' => "Field '$field' is required"], 400);
                exit;
            }
        }
        
        // Check if user already has a pending verification request
        $stmt = $pdo->prepare("SELECT id FROM verification_requests WHERE user_id = ? AND status = 'pending'");
        $stmt->execute([$user_id]);
        if ($stmt->rowCount() > 0) {
            json_response(['error' => 'You already have a pending verification request'], 400);
            exit;
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
            if (empty($school_id_type) || empty($school_id_number) || empty($school_id_image)) {
                json_response(['error' => 'School information is required for students'], 400);
                exit;
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
                json_response(['error' => 'Government ID information is required'], 400);
                exit;
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

        json_response([
            'success' => true,
            'message' => 'Verification request submitted successfully',
            'verification_id' => $verification_id
        ]);

    } catch (PDOException $e) {
        error_log("Verification Submit Error: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    } catch (Exception $e) {
        error_log("Verification Submit General Error: " . $e->getMessage());
        json_response(['error' => $e->getMessage()], 500);
    }
} else {
    json_response(['error' => 'Method not allowed'], 405);
}
?>
