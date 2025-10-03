<?php
/**
 * Test Email Setup - Check if PHPMailer is installed
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json');

try {
    // Check if PHPMailer files exist
    $phpMailerPath = __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';
    $smtpPath = __DIR__ . '/../vendor/phpmailer/phpmailer/src/SMTP.php';
    $exceptionPath = __DIR__ . '/../vendor/phpmailer/phpmailer/src/Exception.php';

    $allFilesExist = file_exists($phpMailerPath) && file_exists($smtpPath) && file_exists($exceptionPath);

    if ($allFilesExist) {
        json_response([
            'success' => true,
            'message' => 'PHPMailer is installed correctly! ✓',
            'phpmailer_status' => 'Available',
            'files' => [
                'PHPMailer.php' => 'Found ✓',
                'SMTP.php' => 'Found ✓',
                'Exception.php' => 'Found ✓'
            ],
            'path' => dirname($phpMailerPath),
            'fallback' => 'Will use PHPMailer for sending emails'
        ]);
    } else {
        json_response([
            'success' => false,
            'message' => 'PHPMailer not found',
            'phpmailer_status' => 'Not Available',
            'files' => [
                'PHPMailer.php' => file_exists($phpMailerPath) ? 'Found ✓' : 'Missing ✗',
                'SMTP.php' => file_exists($smtpPath) ? 'Found ✓' : 'Missing ✗',
                'Exception.php' => file_exists($exceptionPath) ? 'Found ✓' : 'Missing ✗'
            ],
            'expected_path' => dirname($phpMailerPath),
            'fallback' => 'Will use PHP mail() function instead',
            'note' => 'Emails will still work using PHP mail() function'
        ]);
    }
} catch (Exception $e) {
    json_response([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
