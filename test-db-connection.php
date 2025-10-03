<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Testing Database Connections</h1>";

// Test 1: ruser / cord3001
echo "<h2>Test 1: ruser / cord3001</h2>";
try {
    $pdo1 = new PDO('mysql:host=127.0.0.1;dbname=roomio;charset=utf8mb4', 'ruser', 'cord3001');
    echo "✅ SUCCESS: Connected with ruser/cord3001<br>";

    $stmt = $pdo1->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "Users count: " . $result['count'] . "<br>";
} catch (PDOException $e) {
    echo "❌ FAILED: " . $e->getMessage() . "<br>";
}

echo "<hr>";

// Test 2: root / (empty)
echo "<h2>Test 2: root / (empty password)</h2>";
try {
    $pdo2 = new PDO('mysql:host=127.0.0.1;dbname=roomio;charset=utf8mb4', 'root', '');
    echo "✅ SUCCESS: Connected with root/(empty)<br>";

    $stmt = $pdo2->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "Users count: " . $result['count'] . "<br>";
} catch (PDOException $e) {
    echo "❌ FAILED: " . $e->getMessage() . "<br>";
}

echo "<hr>";

// Test 3: localhost vs 127.0.0.1
echo "<h2>Test 3: localhost vs 127.0.0.1</h2>";
try {
    $pdo3 = new PDO('mysql:host=localhost;dbname=roomio;charset=utf8mb4', 'ruser', 'cord3001');
    echo "✅ SUCCESS: Connected with localhost/ruser/cord3001<br>";
} catch (PDOException $e) {
    echo "❌ FAILED: " . $e->getMessage() . "<br>";
}

try {
    $pdo4 = new PDO('mysql:host=localhost;dbname=roomio;charset=utf8mb4', 'root', '');
    echo "✅ SUCCESS: Connected with localhost/root/(empty)<br>";
} catch (PDOException $e) {
    echo "❌ FAILED: " . $e->getMessage() . "<br>";
}
?>
