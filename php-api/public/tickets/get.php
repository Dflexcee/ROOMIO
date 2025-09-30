<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

$userId = $_SESSION['user_id'];
$ticketId = $_GET['id'] ?? null;

if (!$ticketId) {
    json_response(['error' => 'Ticket ID is required'], 400);
    exit;
}

try {
    // Get ticket details
    $stmt = $pdo->prepare("
        SELECT * FROM tickets
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$ticketId, $userId]);
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ticket) {
        json_response(['error' => 'Ticket not found or access denied'], 404);
        exit;
    }

    // Get all responses for this ticket
    $stmt = $pdo->prepare("
        SELECT
            tr.*,
            u.full_name,
            u.email,
            u.role
        FROM ticket_responses tr
        LEFT JOIN users u ON tr.user_id = u.id
        WHERE tr.ticket_id = ?
        ORDER BY tr.created_at ASC
    ");
    $stmt->execute([$ticketId]);
    $responses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    json_response([
        'success' => true,
        'ticket' => $ticket,
        'responses' => $responses
    ]);

} catch (PDOException $e) {
    error_log('Ticket get error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>