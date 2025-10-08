<?php
require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../middleware/rate-limiter.php';

// Rate limiting: 5 login attempts per 15 minutes per IP
check_rate_limit($pdo, 'login', 5, 900);

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

// Successful login - reset rate limit for this IP
reset_rate_limit($pdo, 'login');

$_SESSION['user_id'] = (int)$user['id'];

error_log("Login successful: user_id = " . $_SESSION['user_id']);

json_response(['user' => ['id' => (int)$user['id'], 'email' => $user['email'], 'role' => $user['role']]]); 
