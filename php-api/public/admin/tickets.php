<?php
require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Config.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

// Check if user is admin
$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user || !in_array($user['role'], ['admin', 'manager'])) {
    json_response(['error' => 'Admin access required'], 403);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get tickets with user info
    try {
        $stmt = $pdo->query("
            SELECT t.*, u.email, u.full_name 
            FROM admin_tickets t 
            LEFT JOIN users u ON t.user_id = u.id 
            ORDER BY t.created_at DESC
        ");
        $tickets = $stmt->fetchAll();
        
        json_response(['tickets' => $tickets]);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create ticket response
    $input = read_json_body();
    
    if (!isset($input['ticket_id']) || !isset($input['message'])) {
        json_response(['error' => 'Missing required fields'], 400);
        exit;
    }
    
    try {
        // Add response
        $stmt = $pdo->prepare("
            INSERT INTO admin_ticket_responses (ticket_id, admin_id, message, is_admin_response) 
            VALUES (?, ?, ?, 1)
        ");
        $stmt->execute([$input['ticket_id'], $_SESSION['user_id'], $input['message']]);
        
        // Update ticket status
        if (isset($input['status'])) {
            $stmt = $pdo->prepare("UPDATE admin_tickets SET status = ? WHERE id = ?");
            $stmt->execute([$input['status'], $input['ticket_id']]);
        }
        
        json_response(['success' => true]);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update ticket status
    $input = read_json_body();
    
    if (!isset($input['ticket_id']) || !isset($input['status'])) {
        json_response(['error' => 'Missing required fields'], 400);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE admin_tickets SET status = ? WHERE id = ?");
        $stmt->execute([$input['status'], $input['ticket_id']]);
        
        json_response(['success' => true]);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
} else {
    json_response(['error' => 'Method not allowed'], 405);
}
?>
