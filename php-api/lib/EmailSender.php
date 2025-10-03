<?php
/**
 * EmailSender Class
 * Sends emails using PHPMailer (primary) with fallback to PHP mail()
 * Uses SMTP settings from database
 */

class EmailSender {
    private $pdo;
    private $usePHPMailer = true;

    public function __construct($pdo) {
        $this->pdo = $pdo;

        // Check if PHPMailer is available
        $phpMailerPath = __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';
        if (!file_exists($phpMailerPath)) {
            $this->usePHPMailer = false;
            error_log('PHPMailer not found, will use PHP mail() function');
        }
    }

    /**
     * Get SMTP settings from database
     */
    private function getSmtpSettings() {
        // Try primary table smtp_settings, fallback to generic settings table, then Config/env
        try {
            // Primary: smtp_settings table
            $stmt = $this->pdo->query("SELECT * FROM smtp_settings ORDER BY id DESC LIMIT 1");
            $settings = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

            // Normalize column names (database has 'host' not 'smtp_host')
            if (!empty($settings['host'])) {
                $settings['smtp_host'] = $settings['host'];
                $settings['smtp_port'] = $settings['port'];
                $settings['smtp_username'] = $settings['username'];
                $settings['smtp_password'] = $settings['password'];
                $settings['encryption'] = $settings['encryption'] ?? 'ssl'; // Default to SSL for port 465
                $settings['from_name'] = $settings['from_name'] ?? 'Roomio';
            }

            if (!$settings || empty($settings['smtp_host'])) {
                // Fallback: settings table with category = 'mail' (Flexcee style)
                try {
                    $kv = [];
                    $fallbackStmt = $this->pdo->prepare("SELECT setting_key, setting_value FROM settings WHERE category = 'mail'");
                    $fallbackStmt->execute();
                    foreach ($fallbackStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                        $kv[$row['setting_key']] = $row['setting_value'];
                    }
                    if (!empty($kv)) {
                        $settings = array_merge($settings, [
                            'smtp_host' => $kv['smtp_host'] ?? null,
                            'smtp_port' => $kv['smtp_port'] ?? null,
                            'smtp_username' => $kv['smtp_username'] ?? null,
                            'smtp_password' => $kv['smtp_password'] ?? null,
                            'from_email' => ($kv['use_hosting_mail'] ?? '') === 'true' ? ($kv['hosting_smtp_username'] ?? null) : ($kv['from_email'] ?? null),
                            'from_name' => $kv['from_name'] ?? 'Roomio',
                            'encryption' => (($kv['use_hosting_mail'] ?? '') === 'true') ? 'ssl' : 'tls',
                        ]);
                    }
                } catch (Throwable $e) {
                    // ignore and continue to env fallback
                }
            }

            // Final fallback: config/env
            if (empty($settings['smtp_host'])) {
                require_once __DIR__ . '/Config.php';
                $settings['smtp_host'] = Config::get('SMTP_HOST');
                $settings['smtp_port'] = Config::get('SMTP_PORT', 587);
                $settings['smtp_username'] = Config::get('SMTP_USERNAME');
                $settings['smtp_password'] = Config::get('SMTP_PASSWORD');
                $settings['from_email'] = Config::get('SMTP_FROM_EMAIL');
                $settings['from_name'] = Config::get('SMTP_FROM_NAME', 'Roomio');
                $settings['encryption'] = Config::get('SMTP_ENCRYPTION', 'tls');
            }

            if (empty($settings['smtp_host']) || empty($settings['smtp_username'])) {
                throw new Exception('SMTP settings not configured. Please configure SMTP at /admin/smtp-settings');
            }

            // Normalize types
            $settings['smtp_port'] = (int)($settings['smtp_port'] ?? 587);
            $settings['encryption'] = strtolower($settings['encryption'] ?? 'tls');

            return $settings;
        } catch (PDOException $e) {
            error_log('Error fetching SMTP settings: ' . $e->getMessage());
            throw new Exception('Failed to fetch SMTP settings');
        }
    }

    /**
     * Send email using PHPMailer
     */
    private function sendWithPHPMailer($to, $subject, $body, $isHtml = true) {
        require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/Exception.php';
        require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';
        require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/SMTP.php';

        $settings = $this->getSmtpSettings();

        $mail = new PHPMailer\PHPMailer\PHPMailer(true);

        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = $settings['smtp_host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $settings['smtp_username'];
            $mail->Password   = $settings['smtp_password'];
            $mail->SMTPSecure = ($settings['encryption'] === 'ssl') ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $settings['smtp_port'];
            $mail->CharSet    = 'UTF-8';

            // Recipients
            $mail->setFrom($settings['from_email'], $settings['from_name']);

            // Support multiple recipients
            if (is_array($to)) {
                foreach ($to as $recipient) {
                    $mail->addAddress($recipient);
                }
            } else {
                $mail->addAddress($to);
            }

            // Content
            $mail->isHTML($isHtml);
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->AltBody = strip_tags($body); // Plain text alternative

            $mail->send();
            return true;

        } catch (Exception $e) {
            error_log("PHPMailer Error: {$mail->ErrorInfo}");
            throw new Exception("PHPMailer failed: {$mail->ErrorInfo}");
        }
    }

    /**
     * Send email using PHP mail() function (fallback)
     */
    private function sendWithPHPMail($to, $subject, $body, $isHtml = true) {
        $settings = $this->getSmtpSettings();

        // Prepare headers
        $headers = [];
        $headers[] = "From: {$settings['from_name']} <{$settings['from_email']}>";
        $headers[] = "Reply-To: {$settings['from_email']}";
        $headers[] = "X-Mailer: PHP/" . phpversion();
        $headers[] = "MIME-Version: 1.0";

        if ($isHtml) {
            $headers[] = "Content-Type: text/html; charset=UTF-8";
        } else {
            $headers[] = "Content-Type: text/plain; charset=UTF-8";
        }

        $headersString = implode("\r\n", $headers);

        // Support multiple recipients
        $toAddress = is_array($to) ? implode(', ', $to) : $to;

        // Send email
        $success = mail($toAddress, $subject, $body, $headersString);

        if (!$success) {
            throw new Exception('PHP mail() function failed');
        }

        return true;
    }

    /**
     * Send email (tries PHPMailer first, falls back to PHP mail())
     *
     * @param string|array $to Email address(es)
     * @param string $subject Email subject
     * @param string $body Email body (HTML or plain text)
     * @param bool $isHtml Whether body is HTML
     * @return bool Success status
     */
    public function send($to, $subject, $body, $isHtml = true) {
        try {
            // Try PHPMailer first if available
            if ($this->usePHPMailer) {
                try {
                    return $this->sendWithPHPMailer($to, $subject, $body, $isHtml);
                } catch (Exception $e) {
                    error_log('PHPMailer failed, trying PHP mail(): ' . $e->getMessage());
                    // Fall through to PHP mail()
                }
            }

            // Fallback to PHP mail()
            return $this->sendWithPHPMail($to, $subject, $body, $isHtml);

        } catch (Exception $e) {
            error_log('All email methods failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send email using template from database
     *
     * @param string|array $to Email address(es)
     * @param string $templateName Template identifier
     * @param array $variables Variables to replace in template
     * @return bool Success status
     */
    public function sendWithTemplate($to, $templateName, $variables = []) {
        try {
            // Fetch template from database
            $stmt = $this->pdo->prepare("SELECT * FROM email_templates WHERE template_name = ? LIMIT 1");
            $stmt->execute([$templateName]);
            $template = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$template) {
                throw new Exception("Email template '{$templateName}' not found");
            }

            // Replace variables in subject and body
            $subject = $template['subject'];
            $body = $template['body'];

            foreach ($variables as $key => $value) {
                $placeholder = '{{' . $key . '}}';
                $subject = str_replace($placeholder, $value, $subject);
                $body = str_replace($placeholder, $value, $body);
            }

            return $this->send($to, $subject, $body, true);

        } catch (Exception $e) {
            error_log('Template email failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send ticket notification email
     */
    public function sendTicketNotification($ticketId, $userEmail, $subject, $message) {
        $settings = $this->getSmtpSettings();

        $body = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>🎫 Roomio Support Ticket #{$ticketId}</h2>
                </div>
                <div class='content'>
                    <p><strong>Subject:</strong> {$subject}</p>
                    <p><strong>Message:</strong></p>
                    <p>{$message}</p>
                    <p style='margin-top: 20px;'>
                        <a href='http://localhost:5173/help-center' class='button'>View Ticket</a>
                    </p>
                </div>
                <div class='footer'>
                    <p>This is an automated message from Roomio Support System</p>
                    <p>&copy; " . date('Y') . " Roomio. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";

        return $this->send($userEmail, "Ticket #{$ticketId}: {$subject}", $body, true);
    }

    /**
     * Send ticket reply notification
     */
    public function sendTicketReplyNotification($ticketId, $userEmail, $subject, $replyMessage, $isFromAdmin = false) {
        $sender = $isFromAdmin ? 'Support Team' : 'You';

        $body = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                .reply { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>💬 New Reply on Ticket #{$ticketId}</h2>
                </div>
                <div class='content'>
                    <p><strong>Subject:</strong> {$subject}</p>
                    <div class='reply'>
                        <p><strong>{$sender} replied:</strong></p>
                        <p>" . nl2br(htmlspecialchars($replyMessage)) . "</p>
                    </div>
                    <p style='margin-top: 20px;'>
                        <a href='http://localhost:5173/help-center' class='button'>View Conversation</a>
                    </p>
                </div>
                <div class='footer'>
                    <p style='margin-bottom: 10px;'><strong>💡 Tip:</strong> You can reply directly to this email and your response will be added to the ticket!</p>
                    <p style='color: #999; font-size: 11px;'>This is an automated message from Roomio Support System</p>
                    <p style='color: #999; font-size: 11px;'>&copy; " . date('Y') . " Roomio. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";

        // Add conversation ID to subject for threading
        $emailSubject = "[TICKET:{$ticketId}] " . ($isFromAdmin ? "Support Reply" : "Your Reply") . " - {$subject}";

        return $this->send($userEmail, $emailSubject, $body, true);
    }

    /**
     * Test email configuration
     */
    public function testConnection() {
        try {
            $settings = $this->getSmtpSettings();

            $testBody = "
            <h2>SMTP Test Email</h2>
            <p>This is a test email to verify your SMTP configuration is working correctly.</p>
            <p><strong>SMTP Host:</strong> {$settings['smtp_host']}</p>
            <p><strong>SMTP Port:</strong> {$settings['smtp_port']}</p>
            <p><strong>From Email:</strong> {$settings['from_email']}</p>
            <p>If you received this email, your SMTP settings are configured correctly!</p>
            ";

            return $this->send(
                $settings['from_email'],
                'Roomio SMTP Test Email',
                $testBody,
                true
            );

        } catch (Exception $e) {
            error_log('SMTP test failed: ' . $e->getMessage());
            return false;
        }
    }
}
?>
