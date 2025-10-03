<?php
// Simple test page to check admin users functionality
session_start();

// Check if logged in
echo "<h2>Session Status</h2>";
echo "<pre>";
echo "Session ID: " . session_id() . "\n";
echo "User ID: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'NOT SET') . "\n";
echo "User Email: " . (isset($_SESSION['email']) ? $_SESSION['email'] : 'NOT SET') . "\n";
echo "</pre>";

// Test database connection
echo "<h2>Database Test</h2>";
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=roomio;charset=utf8mb4', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<p style='color:green'>✓ Database connected successfully</p>";

    // Count users
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Total users in database: " . $result['count'] . "</p>";

    // Show first 3 users
    echo "<h3>Sample Users</h3>";
    $stmt = $pdo->query("SELECT id, email, full_name, role, status FROM users LIMIT 3");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Email</th><th>Name</th><th>Role</th><th>Status</th></tr>";
    foreach ($users as $user) {
        echo "<tr>";
        echo "<td>" . $user['id'] . "</td>";
        echo "<td>" . htmlspecialchars($user['email']) . "</td>";
        echo "<td>" . htmlspecialchars($user['full_name'] ?: 'N/A') . "</td>";
        echo "<td>" . $user['role'] . "</td>";
        echo "<td>" . $user['status'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";

} catch (PDOException $e) {
    echo "<p style='color:red'>✗ Database error: " . $e->getMessage() . "</p>";
}

// Test API endpoint
echo "<h2>API Endpoint Test</h2>";
$apiUrl = "http://localhost/roomio/php-api/public/admin/users-clean.php";
echo "<p>Testing: <code>$apiUrl</code></p>";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_COOKIE, "PHPSESSID=" . session_id());
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "<p>HTTP Status: $httpCode</p>";
echo "<h3>Response:</h3>";
echo "<pre>" . htmlspecialchars(substr($response, 0, 500)) . "</pre>";

// Login link
echo "<h2>Quick Actions</h2>";
if (!isset($_SESSION['user_id'])) {
    echo "<p><a href='../auth/login.php'>Login</a> to test authenticated features</p>";
}
echo "<p><a href='http://localhost:5173/admin/users'>Go to Admin Users Page</a></p>";
echo "<p><a href='http://localhost:5173/profile-edit'>Go to Profile Edit Page</a></p>";
?>
