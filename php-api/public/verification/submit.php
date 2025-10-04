<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check authentication
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (empty($input['account_type']) || empty($input['full_name']) || empty($input['phone'])) {
        json_response(['error' => 'Account type, full name, and phone are required'], 400);
        exit;
    }

    $account_type = $input['account_type'];
    $full_name = trim($input['full_name']);
    $phone = trim($input['phone']);

    // Validate based on account type
    if ($account_type === 'student') {
        if (empty($input['school_name']) || empty($input['school_id_number'])) {
            json_response(['error' => 'School information is required for students'], 400);
            exit;
        }
        $school_name = trim($input['school_name']);
        $school_id_type = $input['school_id_type'] ?? 'student_id';
        $school_id_number = trim($input['school_id_number']);
        $government_id_type = null;
        $government_id_number = null;
        $nin = null;
    } else {
        if (empty($input['government_id_number']) || empty($input['nin'])) {
            json_response(['error' => 'Government ID and NIN are required'], 400);
            exit;
        }
        $government_id_type = $input['government_id_type'] ?? 'national_id';
        $government_id_number = trim($input['government_id_number']);
        $nin = trim($input['nin']);
        $school_name = null;
        $school_id_type = null;
        $school_id_number = null;
    }

    // Check if user already has a pending verification
    $stmt = $pdo->prepare("SELECT id FROM verification_requests WHERE user_id = ? AND status = 'pending'");
    $stmt->execute([$user_id]);
    if ($stmt->rowCount() > 0) {
        json_response(['error' => 'You already have a pending verification request'], 400);
        exit;
    }

    // Insert verification request
    $stmt = $pdo->prepare("
        INSERT INTO verification_requests (
            user_id, account_type, full_name, phone,
            government_id_type, government_id_number, nin,
            school_id_type, school_id_number, school_name,
            status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    ");

    $stmt->execute([
        $user_id, $account_type, $full_name, $phone,
        $government_id_type, $government_id_number, $nin,
        $school_id_type, $school_id_number, $school_name
    ]);

    $verification_id = $pdo->lastInsertId();

    // Update user's verification status
    $stmt = $pdo->prepare("
        UPDATE users
        SET verification_status = 'pending',
            account_type = ?,
            full_name = ?,
            phone = ?,
            updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$account_type, $full_name, $phone, $user_id]);

    json_response([
        'success' => true,
        'message' => 'Verification request submitted successfully',
        'verification_id' => $verification_id
    ]);

} catch (PDOException $e) {
    error_log("Verification Submit Error: " . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
} catch (Exception $e) {
    error_log("Verification Submit Error: " . $e->getMessage());
    json_response(['error' => $e->getMessage()], 500);
}
?>
