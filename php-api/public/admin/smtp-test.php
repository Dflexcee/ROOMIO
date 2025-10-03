<?php
require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';
require_once '../../lib/EmailSender.php';

// Require admin
$admin = require_admin($pdo);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$to = trim($input['email'] ?? '');

if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    json_response(['error' => 'Valid email is required'], 400);
    exit;
}

try {
    $sender = new EmailSender($pdo);
    $subject = 'Roomio SMTP Test';
    $body = '<p>This is a test email from Roomio SMTP settings page.</p><p>If you received this, your SMTP configuration is working.</p>';
    $ok = $sender->send($to, $subject, $body, true);
    if ($ok) {
        json_response(['success' => true, 'message' => 'Test email sent successfully to ' . $to]);
    } else {
        json_response(['error' => 'Failed to send test email'], 500);
    }
} catch (Throwable $e) {
    error_log('SMTP test send failed: ' . $e->getMessage());
    json_response(['error' => 'SMTP test failed: ' . $e->getMessage()], 500);
}
?>


