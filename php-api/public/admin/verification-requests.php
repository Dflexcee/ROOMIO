<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in and is admin
require_auth();
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Method not allowed'], 405);
}

try {
    $stmt = $pdo->prepare("
        SELECT id, full_name, email, role, verification_status, verification_id_url, verification_submitted_at
        FROM users 
        WHERE role IN ('agent', 'landlord') 
        AND verification_status = 'pending'
        ORDER BY verification_submitted_at DESC
    ");
    $stmt->execute();
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    json_response([
        'success' => true,
        'requests' => $requests
    ]);
    
} catch (PDOException $e) {
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>
