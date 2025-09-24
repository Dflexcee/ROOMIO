<?php
require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';

$body = read_json_body();
$email = isset($body['email']) ? trim(strtolower($body['email'])) : '';
$password = isset($body['password']) ? $body['password'] : '';

if ($email === '' || $password === '') {
    json_response(['error' => 'Email and password are required'], 400);
    exit;
}

$stmt = $pdo->prepare('SELECT id, email, password_hash, role FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_response(['error' => 'Invalid credentials'], 401);
    exit;
}

$_SESSION['user_id'] = (int)$user['id'];

json_response(['user' => ['id' => (int)$user['id'], 'email' => $user['email'], 'role' => $user['role']]]); 