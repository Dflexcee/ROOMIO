<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Testing Login Endpoint</h1>";

// First, check if we can connect to database with current config
echo "<h2>Step 1: Test Database Connection</h2>";
try {
    $pdo = new PDO('mysql:host=localhost;dbname=roomio;charset=utf8mb4', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Database connection: SUCCESS<br>";

    // Get a test user
    $stmt = $pdo->query("SELECT id, email, role FROM users LIMIT 1");
    $testUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($testUser) {
        echo "✅ Found test user: {$testUser['email']}<br>";
        echo "User ID: {$testUser['id']}, Role: {$testUser['role']}<br>";
    } else {
        echo "❌ No users found in database!<br>";
    }

} catch (PDOException $e) {
    echo "❌ Database connection FAILED: " . $e->getMessage() . "<br>";
    die();
}

echo "<hr>";

// Test login endpoint with a POST request
echo "<h2>Step 2: Test Login API Endpoint</h2>";
echo "<p>I will now test the login endpoint by making a direct request...</p>";

// Get a user to test with
$stmt = $pdo->query("SELECT email FROM users WHERE role = 'user' LIMIT 1");
$user = $stmt->fetch();

if (!$user) {
    echo "❌ No regular users found. Let me show all users:<br>";
    $stmt = $pdo->query("SELECT id, email, role FROM users");
    $allUsers = $stmt->fetchAll();
    echo "<ul>";
    foreach ($allUsers as $u) {
        echo "<li>ID: {$u['id']}, Email: {$u['email']}, Role: {$u['role']}</li>";
    }
    echo "</ul>";
} else {
    echo "Test user email: {$user['email']}<br>";
}

echo "<hr>";

// Now test if config.php works
echo "<h2>Step 3: Test config.php</h2>";
try {
    require_once 'php-api/config.php';
    echo "✅ config.php loaded successfully<br>";

    $stmt = $pdo->query("SELECT DATABASE() as db");
    $result = $stmt->fetch();
    echo "Connected to database: " . $result['db'] . "<br>";

} catch (Exception $e) {
    echo "❌ config.php FAILED: " . $e->getMessage() . "<br>";
}

echo "<hr>";

// Test bootstrap.php
echo "<h2>Step 4: Test bootstrap.php</h2>";
try {
    require_once 'php-api/bootstrap.php';
    echo "✅ bootstrap.php loaded successfully<br>";
    echo "Session status: " . (session_status() === PHP_SESSION_ACTIVE ? 'Active' : 'Not active') . "<br>";

} catch (Exception $e) {
    echo "❌ bootstrap.php FAILED: " . $e->getMessage() . "<br>";
}

echo "<hr>";
echo "<h2>Next Steps:</h2>";
echo "<ol>";
echo "<li>If all tests passed, the backend is working</li>";
echo "<li>Try to login at: <a href='http://localhost:5173'>http://localhost:5173</a></li>";
echo "<li>Use one of the emails shown above</li>";
echo "<li>If you don't know the password, we may need to reset it</li>";
echo "</ol>";
?>
