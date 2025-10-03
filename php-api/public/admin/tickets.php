<?php
require_once '../../config.php';
require_once '../../bootstrap.php';

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id'])) {
    json_response(['error' => 'Authentication required'], 401);
    exit;
}

// Check if user is admin
$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !in_array($user['role'], ['admin', 'manager'])) {
    json_response(['error' => 'Admin access required'], 403);
    exit;
}

$adminId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get all tickets with user info and response count
    try {
        $stmt = $pdo->query("
            SELECT
                t.*,
                u.email,
                u.full_name,
                u.phone,
                COUNT(DISTINCT tr.id) as response_count
            FROM tickets t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN ticket_responses tr ON t.id = tr.ticket_id
            GROUP BY t.id
            ORDER BY t.created_at DESC
        ");
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get responses for each ticket
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

        json_response(['success' => true, 'tickets' => $tickets]);
    } catch (PDOException $e) {
        error_log('Admin tickets list error: ' . $e->getMessage());
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Admin reply to ticket
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['ticket_id']) || empty($input['message'])) {
        json_response(['error' => 'Ticket ID and message are required'], 400);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Get ticket details for email
        $stmt = $pdo->prepare("
            SELECT t.*, u.email, u.full_name
            FROM tickets t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.id = ?
        ");
        $stmt->execute([$input['ticket_id']]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$ticket) {
            json_response(['error' => 'Ticket not found'], 404);
            exit;
        }

        // Add admin response
        $stmt = $pdo->prepare("
            INSERT INTO ticket_responses (ticket_id, admin_id, message, is_admin_response, created_at)
            VALUES (?, ?, ?, TRUE, NOW())
        ");
        $stmt->execute([$input['ticket_id'], $adminId, $input['message']]);

        $responseId = $pdo->lastInsertId();

        // Update ticket status and timestamp
        $newStatus = $input['status'] ?? 'in_progress';
        $stmt = $pdo->prepare("
            UPDATE tickets
            SET status = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$newStatus, $input['ticket_id']]);

        $pdo->commit();

        // Send email notification to user
        if ($ticket['email']) {
            require_once '../../lib/EmailSender.php';
            try {
                $emailSender = new EmailSender($pdo);
                $emailSender->sendTicketReplyNotification(
                    $input['ticket_id'],
                    $ticket['email'],
                    $ticket['subject'],
                    $input['message'],
                    true // isFromAdmin
                );
                error_log("Admin reply email sent to: {$ticket['email']} for ticket #{$input['ticket_id']}");
            } catch (Exception $e) {
                error_log('Failed to send admin reply email: ' . $e->getMessage());
                // Don't fail the request if email fails
            }
        }

        json_response([
            'success' => true,
            'message' => 'Reply sent successfully'
        ]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log('Admin ticket reply error: ' . $e->getMessage());
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update ticket status
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['ticket_id']) || empty($input['status'])) {
        json_response(['error' => 'Ticket ID and status are required'], 400);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE tickets
            SET status = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$input['status'], $input['ticket_id']]);

        json_response(['success' => true]);
    } catch (PDOException $e) {
        error_log('Admin ticket status update error: ' . $e->getMessage());
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete ticket
    $input = json_decode(file_get_contents('php://input'), true);

    if (empty($input['ticket_id'])) {
        json_response(['error' => 'Ticket ID is required'], 400);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Delete responses first
        $stmt = $pdo->prepare("DELETE FROM ticket_responses WHERE ticket_id = ?");
        $stmt->execute([$input['ticket_id']]);

        // Delete ticket
        $stmt = $pdo->prepare("DELETE FROM tickets WHERE id = ?");
        $stmt->execute([$input['ticket_id']]);

        $pdo->commit();

        json_response(['success' => true]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log('Admin ticket delete error: ' . $e->getMessage());
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
} else {
    json_response(['error' => 'Method not allowed'], 405);
}
?>
