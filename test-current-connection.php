<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Testing Current Configuration</h1>";

// Test with exact config.php settings
echo "<h2>Testing: ruser / cord3001 @ localhost</h2>";
try {
    $pdo = new PDO('mysql:host=localhost;dbname=roomio;charset=utf8mb4', 'ruser', 'cord3001');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ SUCCESS: Connected!<br>";

    // Test query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "Users in database: " . $result['count'] . "<br>";

    // List all users
    $stmt = $pdo->query("SELECT id, email, role FROM users");
    $users = $stmt->fetchAll();
    echo "<h3>Available users:</h3><ul>";
    foreach ($users as $user) {
        echo "<li>ID: {$user['id']}, Email: {$user['email']}, Role: {$user['role']}</li>";
    }
    echo "</ul>";

} catch (PDOException $e) {
    echo "❌ FAILED: " . $e->getMessage() . "<br>";
    echo "Error Code: " . $e->getCode() . "<br>";
}

echo "<hr>";

// Now test the actual config.php file
echo "<h2>Testing config.php directly</h2>";
try {
    require_once 'php-api/config.php';
    echo "✅ config.php loaded successfully<br>";

    // Test connection
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "Users count from config.php: " . $result['count'] . "<br>";

} catch (Exception $e) {
    echo "❌ config.php FAILED: " . $e->getMessage() . "<br>";
}

echo "<hr>";

// Test login.php endpoint
echo "<h2>Testing login endpoint</h2>";
echo "<p>Visit: <a href='http://localhost/roomio/php-api/public/auth/login.php'>http://localhost/roomio/php-api/public/auth/login.php</a></p>";
?>
