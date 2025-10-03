<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // Get user's tickets with response count
    $stmt = $pdo->prepare("
        SELECT
            t.*,
            COUNT(tr.id) as response_count
        FROM tickets t
        LEFT JOIN ticket_responses tr ON t.id = tr.ticket_id
        WHERE t.user_id = ?
        GROUP BY t.id
        ORDER BY t.updated_at DESC
    ");
    $stmt->execute([$userId]);
    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch responses for each ticket
    foreach ($tickets as &$ticket) {
        $stmt = $pdo->prepare("
            SELECT
                tr.*,
                u.full_name,
                u.email,
                u.role
            FROM ticket_responses tr
            LEFT JOIN users u ON COALESCE(tr.admin_id, tr.user_id) = u.id
            WHERE tr.ticket_id = ?
            ORDER BY tr.created_at ASC
        ");
        $stmt->execute([$ticket['id']]);
        $ticket['ticket_responses'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    json_response([
        'success' => true,
        'tickets' => $tickets
    ]);

} catch (PDOException $e) {
    error_log('Ticket list error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>