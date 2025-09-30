<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../bootstrap.php';

function hash_password(string $password): string {
    return password_hash($password, PASSWORD_BCRYPT);
}

function verify_password(string $password, string $hash): bool {
    return password_verify($password, $hash);
}

function require_auth(PDO $pdo, bool $check_status = true): array {
    if (!isset($_SESSION['user_id'])) {
        json_response(['error' => 'Not authenticated'], 401);
        exit;
    }

    // Use the status check middleware if enabled
    if ($check_status) {
        // This will exit with 403 if user is banned/suspended/inactive
        $user = checkUserStatus($pdo, $_SESSION['user_id'], true);
        return $user;
    }

    // Fallback to basic auth check (without status validation)
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