<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../bootstrap.php';

function hash_password(string $password): string {
    return password_hash($password, PASSWORD_BCRYPT);
}

function verify_password(string $password, string $hash): bool {
    return password_verify($password, $hash);
}

function require_auth(PDO $pdo): array {
    if (!isset($_SESSION['user_id'])) {
        json_response(['error' => 'Not authenticated'], 401);
        exit;
    }
    $stmt = $pdo->prepare('SELECT id, email, role, created_at FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    if (!$user) {
        session_destroy();
        json_response(['error' => 'User not found'], 401);
        exit;
    }
    return $user;
}

function require_admin(PDO $pdo): array {
    $user = require_auth($pdo);
    if ($user['role'] !== 'admin') {
        json_response(['error' => 'Forbidden: admin only'], 403);
        exit;
    }
    return $user;
} 