<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'];

// Validate required fields
if (empty($input['ticket_id']) || empty($input['message'])) {
    json_response(['error' => 'Ticket ID and message are required'], 400);
    exit;
}

try {
    // Verify ticket exists and belongs to user
    $stmt = $pdo->prepare("SELECT * FROM tickets WHERE id = ? AND user_id = ?");
    $stmt->execute([$input['ticket_id'], $userId]);
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ticket) {
        json_response(['error' => 'Ticket not found or access denied'], 404);
        exit;
    }

    // Start transaction
    $pdo->beginTransaction();

    // Add response
    $stmt = $pdo->prepare("
        INSERT INTO ticket_responses (ticket_id, user_id, message, is_admin, created_at)
        VALUES (?, ?, ?, FALSE, NOW())
    ");
    $stmt->execute([$input['ticket_id'], $userId, $input['message']]);

    $responseId = $pdo->lastInsertId();

    // Update ticket's updated_at timestamp
    $stmt = $pdo->prepare("UPDATE tickets SET updated_at = NOW() WHERE id = ?");
    $stmt->execute([$input['ticket_id']]);

    $pdo->commit();

    // Get the created response with user info
    $stmt = $pdo->prepare("
        SELECT
            tr.*,
            u.full_name,
            u.email,
            u.role
        FROM ticket_responses tr
        LEFT JOIN users u ON tr.user_id = u.id
        WHERE tr.id = ?
    ");
    $stmt->execute([$responseId]);
    $response = $stmt->fetch(PDO::FETCH_ASSOC);

    json_response([
        'success' => true,
        'response' => $response,
        'message' => 'Reply added successfully'
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    error_log('Ticket reply error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>