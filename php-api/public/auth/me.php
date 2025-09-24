<?php
require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';

if (!isset($_SESSION['user_id'])) {
    json_response(['user' => null]);
    exit;
}

$stmt = $pdo->prepare('SELECT id, email, role, created_at FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

json_response(['user' => $user ?: null]); 