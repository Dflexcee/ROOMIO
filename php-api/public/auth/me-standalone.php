<?php
// Standalone auth/me endpoint without bootstrap
header('Content-Type: application/json');
require_once __DIR__ . '/../../lib/UrlHelper.php';
require_once __DIR__ . '/../../lib/Config.php';
UrlHelper::applyCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['user' => null]);
    exit;
}

// Connect to database
try {
    $host = Config::get('DB_HOST', 'localhost');
    $dbname = Config::get('DB_NAME', 'roomio');
    $username = Config::get('DB_USER', 'root');
    $password = Config::get('DB_PASS', '');
    $charset = 'utf8mb4';
    
    $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get user
    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        // User doesn't exist - clear session
        session_destroy();
        echo json_encode(['user' => null]);
        exit;
    }

    // Add defaults for missing fields
    if (!isset($user['can_post_rooms'])) $user['can_post_rooms'] = 0;
    if (!isset($user['can_post_listings'])) $user['can_post_listings'] = 0;
    if (!isset($user['posting_suspended_reason'])) $user['posting_suspended_reason'] = '';

    echo json_encode(['user' => $user]);

} catch (PDOException $e) {
    error_log("Auth me error: " . $e->getMessage());
    echo json_encode(['user' => null, 'error' => $e->getMessage()]);
}
?>
