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
if (empty($input['subject']) || empty($input['message'])) {
    json_response(['error' => 'Subject and message are required'], 400);
    exit;
}

// Validate priority
$priority = $input['priority'] ?? 'medium';
if (!in_array($priority, ['low', 'medium', 'high'])) {
    $priority = 'medium';
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // Create ticket
    $stmt = $pdo->prepare("
        INSERT INTO tickets (user_id, subject, description, priority, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'open', NOW(), NOW())
    ");
    $stmt->execute([$userId, $input['subject'], $input['message'], $priority]);

    $ticketId = $pdo->lastInsertId();

    // Add initial message as response
    $stmt = $pdo->prepare("
        INSERT INTO ticket_responses (ticket_id, user_id, message, is_admin_response, created_at)
        VALUES (?, ?, ?, FALSE, NOW())
    ");
    $stmt->execute([$ticketId, $userId, $input['message']]);

    $pdo->commit();

    // Get the created ticket with user info
    $stmt = $pdo->prepare("
        SELECT t.*, u.email, u.full_name
        FROM tickets t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.id = ?
    ");
    $stmt->execute([$ticketId]);
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    // Send email notification to user (confirmation)
    if ($ticket && $ticket['email']) {
        require_once '../../lib/EmailSender.php';
        try {
            $emailSender = new EmailSender($pdo);
            $emailSender->sendTicketNotification(
                $ticketId,
                $ticket['email'],
                $input['subject'],
                $input['message']
            );
            error_log("Ticket creation email sent to: {$ticket['email']}");
        } catch (Exception $e) {
            error_log('Failed to send ticket creation email: ' . $e->getMessage());
            // Don't fail the request if email fails
        }
    }

    json_response([
        'success' => true,
        'ticket' => $ticket,
        'ticket_id' => $ticketId,
        'message' => 'Ticket created successfully'
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    error_log('Ticket creation error: ' . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>