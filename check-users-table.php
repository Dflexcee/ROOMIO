<?php
$pdo = new PDO('mysql:host=localhost;dbname=roomio', 'root', '');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Get table structure
$stmt = $pdo->query("DESCRIBE users");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Users table columns:\n";
foreach ($columns as $col) {
    echo "  - {$col['Field']} ({$col['Type']})\n";
}

// Get all users
echo "\nExisting users:\n";
$stmt = $pdo->query("SELECT id, email, full_name, role FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($users as $user) {
    echo "  - ID: {$user['id']}, Email: {$user['email']}, Name: {$user['full_name']}, Role: {$user['role']}\n";
}
?>
