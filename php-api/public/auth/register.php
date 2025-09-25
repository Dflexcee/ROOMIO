<?php
require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../lib/Auth.php';

$body = read_json_body();
$email = isset($body['email']) ? trim(strtolower($body['email'])) : '';
$password = isset($body['password']) ? $body['password'] : '';

if ($email === '' || $password === '') {
    json_response(['error' => 'Email and password are required'], 400);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['error' => 'Invalid email'], 400);
    exit;
}

// Check if exists
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    json_response(['error' => 'Email already registered'], 409);
    exit;
}

$hash = hash_password($password);
$stmt = $pdo->prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)');
$stmt->execute([$email, $hash, 'user']);
$id = (int)$pdo->lastInsertId();

$_SESSION['user_id'] = $id;

json_response(['user' => ['id' => $id, 'email' => $email, 'role' => 'user']]); 
