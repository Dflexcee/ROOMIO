<?php
/**
 * Admin: Verification Settings
 * GET  -> returns current settings
 * PUT  -> updates settings
 *
 * Backed by `settings` table with category = 'app'
 * Keys used:
 *  - require_verification_posting (0/1)
 *  - require_verification_rooms (0/1) optional override
 *  - require_verification_listings (0/1) optional override
 */

require_once '../../config.php';
require_once '../../bootstrap.php';
require_once '../../lib/Auth.php';

// Require admin
$admin = require_admin($pdo);

function get_app_settings(PDO $pdo): array {
    try {
        $stmt = $pdo->prepare("SELECT setting_key, setting_value FROM settings WHERE category = 'app'");
        $stmt->execute();
        $kv = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $kv[$row['setting_key']] = $row['setting_value'];
        }
        return [
            'require_verification_posting' => (int)($kv['require_verification_posting'] ?? 1),
            'require_verification_rooms' => (int)($kv['require_verification_rooms'] ?? 0),
            'require_verification_listings' => (int)($kv['require_verification_listings'] ?? 0),
        ];
    } catch (Throwable $e) {
        error_log('Read app settings failed: ' . $e->getMessage());
        return [
            'require_verification_posting' => 1,
            'require_verification_rooms' => 0,
            'require_verification_listings' => 0,
        ];
    }
}

function set_app_setting(PDO $pdo, string $key, string $value): void {
    $stmt = $pdo->prepare("INSERT INTO settings (category, setting_key, setting_value) VALUES ('app', ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
    $stmt->execute([$key, $value]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['success' => true, 'settings' => get_app_settings($pdo)]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $allowed = ['require_verification_posting', 'require_verification_rooms', 'require_verification_listings'];
    foreach ($allowed as $key) {
        if (array_key_exists($key, $input)) {
            $val = (string)((int)$input[$key]);
            set_app_setting($pdo, $key, $val);
        }
    }
    json_response(['success' => true, 'settings' => get_app_settings($pdo)]);
    exit;
}

json_response(['error' => 'Method not allowed'], 405);
?>


