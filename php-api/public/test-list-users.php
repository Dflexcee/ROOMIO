<?php
require_once '../config.php';
require_once '../bootstrap.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT id, email, full_name, role, verification_status, can_post_rooms, can_post_listings FROM users ORDER BY id");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    json_response([
        'success' => true,
        'total_users' => count($users),
        'users' => $users
    ]);
} catch (PDOException $e) {
    json_response(['error' => $e->getMessage()], 500);
}
?>
