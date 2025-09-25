<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'];

// Validate required fields
$allowedFields = [
    'full_name', 'age', 'gender', 'university', 'department', 
    'budget_range', 'religion', 'lifestyle', 'about_me', 'phone'
];

$updateData = [];
foreach ($allowedFields as $field) {
    if (isset($input[$field])) {
        $updateData[$field] = $input[$field];
    }
}

if (empty($updateData)) {
    json_response(['error' => 'No valid fields to update'], 400);
}

// Add updated_at timestamp
$updateData['updated_at'] = date('Y-m-d H:i:s');

// Build SQL query
$setClause = [];
$values = [];
foreach ($updateData as $field => $value) {
    $setClause[] = "$field = ?";
    $values[] = $value;
}
$values[] = $userId;

$sql = "UPDATE users SET " . implode(', ', $setClause) . " WHERE id = ?";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    
    // Get updated user data
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Remove password_hash from response
    unset($user['password_hash']);
    
    json_response([
        'success' => true,
        'user' => $user
    ]);
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
