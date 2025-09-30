<?php
// Add CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../lib/Auth.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

try {
    // Get all users with profile data - dynamic column selection
    $tablesStmt = $pdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Check what columns exist in users table
    $stmt = $pdo->query("SHOW COLUMNS FROM users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Build dynamic query with available columns
    $selectFields = ['u.id', 'u.email'];
    
    foreach (['role', 'full_name', 'age', 'gender', 'university', 'department', 'budget_range', 'religion', 'lifestyle', 'created_at'] as $field) {
        if (in_array($field, $columns)) {
            $selectFields[] = 'u.' . $field;
        }
    }
    
    $sql = "SELECT " . implode(', ', $selectFields) . " FROM users u WHERE u.role != 'banned' AND u.role != 'admin' ORDER BY u.created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    json_response(['users' => $users]);
    
} catch (Exception $e) {
    error_log('Users list error: ' . $e->getMessage());
    json_response(['error' => 'Database error occurred'], 500);
}
?>
