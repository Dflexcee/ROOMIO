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

try {
    // Check what columns exist in users table
    $stmt = $pdo->query("SHOW COLUMNS FROM users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Define all possible profile fields
    $possibleFields = [
        'full_name', 'age', 'gender', 'university', 'department', 
        'budget_range', 'religion', 'lifestyle', 'about_me', 'phone'
    ];
    
    // Only use fields that exist in the table and are provided in input
    $updateData = [];
    foreach ($possibleFields as $field) {
        if (in_array($field, $columns) && isset($input[$field])) {
            $updateData[$field] = $input[$field];
        }
    }
    
    if (empty($updateData)) {
        json_response(['error' => 'No valid fields to update'], 400);
        exit;
    }
    
    // Build SQL query
    $setClause = [];
    $values = [];
    foreach ($updateData as $field => $value) {
        $setClause[] = "$field = ?";
        $values[] = $value;
    }
    $values[] = $userId;
    
    $sql = "UPDATE users SET " . implode(', ', $setClause) . " WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute($values);
    
    if (!$result) {
        json_response(['error' => 'Failed to update profile'], 500);
        exit;
    }
    
    // Get updated user data with only existing columns
    $userSelectFields = [];
    foreach (['id', 'email', 'role', 'full_name', 'age', 'gender', 'university', 'department', 'budget_range', 'religion', 'lifestyle', 'about_me', 'phone', 'created_at'] as $field) {
        if (in_array($field, $columns)) {
            $userSelectFields[] = $field;
        }
    }
    
    $sql = "SELECT " . implode(', ', $userSelectFields) . " FROM users WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        json_response(['error' => 'User not found after update'], 500);
        exit;
    }
    
    // Remove password_hash from response if it exists
    unset($user['password_hash']);
    
    json_response([
        'success' => true,
        'user' => $user,
        'message' => 'Profile updated successfully',
        'updated_fields' => array_keys($updateData),
        'available_columns' => $columns
    ]);
    
} catch (PDOException $e) {
    error_log("Profile update error: " . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
