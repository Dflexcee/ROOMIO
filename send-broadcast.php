<?php
// send-broadcast.php
// Allow CORS for local development (optional, secure this in production)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Load SMTP settings from a config file or environment variables
$smtp_host = getenv('SMTP_HOST') ?: 'mail.yourdomain.com';
$smtp_port = getenv('SMTP_PORT') ?: 587;
$smtp_user = getenv('SMTP_USER') ?: 'admin@yourdomain.com';
$smtp_pass = getenv('SMTP_PASS') ?: 'yourpassword';
$smtp_from = getenv('SMTP_FROM') ?: 'admin@yourdomain.com';
$smtp_from_name = getenv('SMTP_FROM_NAME') ?: 'Admin';

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$to = $data['to'] ?? [];
if (!is_array($to)) $to = [$to];
$subject = $data['subject'] ?? '';
$body = $data['body'] ?? '';
$bodyType = $data['bodyType'] ?? 'text';

if (empty($to) || !$subject || !$body) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$successCount = 0;
$failCount = 0;
$failedRecipients = [];
$headers = "From: $smtp_from\r\n";
$headers .= "Reply-To: $smtp_from\r\n";
if ($bodyType === 'html') {
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
} else {
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
}

// Try PHP mail() for each recipient
foreach ($to as $recipient) {
    $mail_result = @mail($recipient, $subject, $body, $headers);
    if ($mail_result) {
        $successCount++;
    } else {
        $failedRecipients[] = $recipient;
        $failCount++;
    }
}

// If any failed, try PHPMailer for those
if ($failCount > 0) {
    require_once __DIR__ . '/phpmailer/src/Exception.php';
    require_once __DIR__ . '/phpmailer/src/PHPMailer.php';
    require_once __DIR__ . '/phpmailer/src/SMTP.php';

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    foreach ($failedRecipients as $recipient) {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = $smtp_host;
            $mail->SMTPAuth   = true;
            $mail->Username   = $smtp_user;
            $mail->Password   = $smtp_pass;
            $mail->SMTPSecure = 'tls';
            $mail->Port       = $smtp_port;
            $mail->setFrom($smtp_from, $smtp_from_name);
            $mail->addAddress($recipient);
            $mail->isHTML($bodyType === 'html');
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->send();
            $successCount++;
            $failCount--;
        } catch (Exception $e) {
            // Still failed
        }
    }
}

echo json_encode([
    'success' => $successCount,
    'failed' => $failCount,
    'total' => count($to)
]); 