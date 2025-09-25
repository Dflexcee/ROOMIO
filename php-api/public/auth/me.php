<?php
require_once __DIR__ . '/../../bootstrap.php';
require_once __DIR__ . '/../../config.php';

if (!isset($_SESSION['user_id'])) {
    json_response(['user' => null]);
    exit;
}

$stmt = $pdo->prepare('
    SELECT 
        id, email, role, created_at, 
        full_name, age, gender, university, department, 
        budget_range, religion, lifestyle, about_me, 
        phone, avatar_url, verification_status, account_type, updated_at
    FROM users WHERE id = ?
');
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

json_response(['user' => $user ?: null]); 
