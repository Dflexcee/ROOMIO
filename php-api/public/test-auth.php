<?php
require_once '../config.php';
require_once '../bootstrap.php';
require_once '../lib/Auth.php';

header('Content-Type: application/json');

try {
    // Try to get authenticated user
    $user = require_auth($pdo);

    json_response([
        'success' => true,
        'authenticated' => true,
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role']
    ]);
} catch (Exception $e) {
    json_response([
        'success' => false,
        'authenticated' => false,
        'error' => $e->getMessage()
    ]);
}
?>
