<?php
/**
 * SMTP Settings Management API
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

$admin = require_admin($pdo);

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Get current SMTP settings
        $stmt = $pdo->query("SELECT * FROM smtp_settings ORDER BY id DESC LIMIT 1");
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$settings) {
            // Return default empty settings
            json_response([
                'success' => true,
                'settings' => [
                    'host' => '',
                    'port' => 587,
                    'username' => '',
                    'password' => '',
                    'from_email' => '',
                    'from_name' => 'Roomio',
                    'encryption' => 'tls'
                ]
            ]);
        } else {
            json_response([
                'success' => true,
                'settings' => [
                    'host' => $settings['host'] ?? '',
                    'port' => $settings['port'] ?? 587,
                    'username' => $settings['username'] ?? '',
                    'password' => $settings['password'] ?? '',
                    'from_email' => $settings['from_email'] ?? '',
                    'from_name' => $settings['from_name'] ?? 'Roomio',
                    'encryption' => $settings['encryption'] ?? 'tls'
                ]
            ]);
        }
    } elseif ($method === 'POST' || $method === 'PUT') {
        // Save/Update SMTP settings
        $input = json_decode(file_get_contents('php://input'), true);

        $host = $input['host'] ?? '';
        $port = (int)($input['port'] ?? 587);
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        $from_email = $input['from_email'] ?? '';

        if (empty($host) || empty($username) || empty($from_email)) {
            json_response(['error' => 'Host, username, and from email are required'], 400);
            exit;
        }

        // Check if settings exist
        $stmt = $pdo->query("SELECT id FROM smtp_settings LIMIT 1");
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            // Update existing settings
            $stmt = $pdo->prepare("
                UPDATE smtp_settings
                SET host = ?, port = ?, username = ?, password = ?, from_email = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $host, $port, $username, $password, $from_email, $existing['id']
            ]);
        } else {
            // Insert new settings
            $stmt = $pdo->prepare("
                INSERT INTO smtp_settings (host, port, username, password, from_email)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $host, $port, $username, $password, $from_email
            ]);
        }

        // Log action (skip if system_logs table doesn't exist)
        try {
            $logStmt = $pdo->prepare("
                INSERT INTO system_logs (user_id, action, details, ip_address, created_at)
                VALUES (?, 'smtp_settings_updated', ?, ?, NOW())
            ");
            $logStmt->execute([
                $admin['id'],
                json_encode(['admin_email' => $admin['email'], 'smtp_host' => $host]),
                $_SERVER['REMOTE_ADDR'] ?? null
            ]);
        } catch (PDOException $e) {
            // Ignore if system_logs doesn't exist
        }

        json_response([
            'success' => true,
            'message' => 'SMTP settings saved successfully'
        ]);
    } else {
        json_response(['error' => 'Method not allowed'], 405);
    }
} catch (PDOException $e) {
    error_log("Database error in smtp-settings.php: " . $e->getMessage());
    json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}
?>