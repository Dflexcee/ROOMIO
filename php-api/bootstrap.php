<?php

require_once __DIR__ . '/lib/Config.php';

$allowedOrigins = Config::getCorsOrigins();

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, credentials');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Handle preflight requests
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin && in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, credentials');
    http_response_code(204);
    exit;
}

$isLocalDev = ($origin && in_array($origin, $allowedOrigins, true));

if (session_status() === PHP_SESSION_NONE) {
    // Configure cookie for dev vs prod
    $cookieParams = [
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => Config::get('SESSION_SECURE', 'false') === 'true',
        'httponly' => Config::get('SESSION_HTTPONLY', 'false') === 'true',
        'samesite' => Config::get('SESSION_SAMESITE', 'Lax'),
    ];
    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params($cookieParams);
    } else {
        // Fallback for very old PHP (ignores samesite)
        session_set_cookie_params(
            $cookieParams['lifetime'],
            $cookieParams['path'],
            $cookieParams['domain'],
            $cookieParams['secure'],
            $cookieParams['httponly']
        );
    }
    session_start();
    
    // Debug session info
    error_log("Session started: " . session_id());
    error_log("Session user_id: " . ($_SESSION['user_id'] ?? 'not set'));
}

function json_response($data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
}

function read_json_body(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) { return []; }
    $parsed = json_decode($raw, true);
    return is_array($parsed) ? $parsed : [];
}

// Load user status validation middleware
require_once __DIR__ . '/middleware/check-user-status.php'; 