<?php

require_once __DIR__ . '/lib/Config.php';

$DB_HOST = Config::get('DB_HOST', 'localhost');
$DB_NAME = Config::get('DB_NAME', 'roomio');
$DB_USER = Config::get('DB_USER', 'root');
$DB_PASS = Config::get('DB_PASS', '');
$DB_CHARSET = 'utf8mb4';


$dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset={$DB_CHARSET}";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed', 'details' => $e->getMessage()]);
    exit;
} 